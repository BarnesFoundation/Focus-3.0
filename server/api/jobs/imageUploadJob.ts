import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import { promisify } from "util";

import { PrismaClient } from "@prisma/client";

import { environmentConfiguration } from "../../config";

const prisma = new PrismaClient();
const s3Client = new S3({ region: environmentConfiguration.aws.region });

const writeFileAsync = promisify(fs.writeFile);
const TMP_PATH = "tmp";

const generatePublicUrl = (photoKey: string) => {
  const href = `https://s3.${environmentConfiguration.aws.region}.amazonaws.com`;
  const bucketUrl = `${href}/${environmentConfiguration.aws.s3Bucket}`;
  const publicUrl = `${bucketUrl}/${encodeURIComponent(photoKey)}`;

  return publicUrl;
};

class ImageUploadJob {
  public static async main(albumId: number, photoId: number) {
    const foundAlbum = await prisma.albums.findUnique({
      where: {
        id: albumId,
      },
    });

    if (foundAlbum) {
      const photoInAlbum = await prisma.photos.findFirst({
        where: {
          id: photoId,
          album_id: albumId,
        },
      });

      // If we located the photo for this album, and it has image data
      // we'll perform the upload for the photo to S3
      if (photoInAlbum && photoInAlbum.searched_image_blob) {
        // Write the image out to a temporary file so we can perform the upload
        const bufferedImage = Buffer.from(photoInAlbum.searched_image_blob);
        const fileName = `$${photoId}_${Date.now()}.png`;
        // await writeFileAsync(fileName, bufferedImage);

        // Now we can upload the image to S3
        await s3Client.putObject({
          ACL: "public-read",
          Bucket: environmentConfiguration.aws.s3Bucket,
          Key: fileName,
          Body: bufferedImage,
        });

        // Now that the photo is uploaded, let's update the photo in the database to
        // 1. Remove the giant blob string
        // 2. Add the S3 URL generated for the image
        const publicUrl = generatePublicUrl(fileName);
        await prisma.photos.update({
          where: {
            id: photoId,
          },
          data: {
            searched_image_blob: null,
            searched_image_s3_url: publicUrl,
          },
        });
      }
    }
  }
}

export default ImageUploadJob;
