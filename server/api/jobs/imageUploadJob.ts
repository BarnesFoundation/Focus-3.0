import { S3 } from "@aws-sdk/client-s3";

import { PrismaClient } from "@prisma/client";

import { environmentConfiguration } from "../../config";

const prisma = new PrismaClient();
const s3Client = new S3({ region: environmentConfiguration.aws.region });

const generatePublicUrl = (photoKey: string) => {
  const href = `https://s3.${environmentConfiguration.aws.region}.amazonaws.com`;
  const bucketUrl = `${href}/${environmentConfiguration.aws.s3Bucket}`;
  const publicUrl = `${bucketUrl}/${encodeURIComponent(photoKey)}`;

  return publicUrl;
};

class ImageUploadJob {
  public static async main(
    albumId: number,
    photoId: number,
    image: Express.Multer.File
  ) {
    console.debug(`Performing ImageUploadJob for
	Album ID: ${albumId}
	Photo ID: ${photoId}
	`);
    const foundAlbum = await prisma.albums.findUnique({
      where: {
        id: albumId,
      },
    });

    if (foundAlbum) {
      console.debug(`Found album for Album ID: ${albumId}`);
      const photoInAlbum = await prisma.photos.findFirst({
        where: {
          id: photoId,
          album_id: albumId,
        },
      });

      // If we located the photo for this album
      // we'll perform the upload for the photo to S3
      if (photoInAlbum) {
        console.debug(`Found photo record for Photo ID: ${photoId}`);
        const fileName = `${photoId}_${Date.now()}.png`;
        const imageBuffer = image.buffer.toString("base64");

        // Now we can upload the image to S3
        console.debug(`Uploading image ${fileName} to S3 bucket`);
        await s3Client.putObject({
          ACL: "public-read",
          Bucket: environmentConfiguration.aws.s3Bucket,
          Key: fileName,
          Body: imageBuffer,
        });

        // Now that the photo is uploaded, let's update the photo in the database to
        // 1. Remove the giant blob string
        // 2. Add the S3 URL generated for the image
        const now = new Date(Date.now()).toISOString();
        const publicUrl = generatePublicUrl(fileName);
        await prisma.photos.update({
          where: {
            id: photoId,

            // TODO - this throws a type error since `album_id` isn't a unique column
            // Let's fix this by possibly making `album_id` and `photo_id` a composite unique key
            // we can then uncomment this following line, once the Prisma schema has been updated
            // album_id: albumId,
          },
          data: {
            searched_image_blob: null,
            searched_image_s3_url: publicUrl,

            // Indicate that the record was updated during this job run
            updated_at: now,
          },
        });
      } else {
        console.warn(`Could not find photo record for Photo ID: ${photoId}`);
      }
    } else {
      console.warn(`Could not find album record for Album ID: ${albumId}`);
    }
  }
}

export default ImageUploadJob;
