import { S3 } from "@aws-sdk/client-s3";
import crypto from "crypto";

import { DatabaseService } from "../services";
import { environmentConfiguration } from "../../config";

const prisma = DatabaseService.instance;
const s3Client = new S3({
  region: environmentConfiguration.aws.region,
  maxAttempts: 5,
});

const generatePublicUrl = (photoKey: string) => {
  const href = `https://s3.${environmentConfiguration.aws.region}.amazonaws.com`;
  const bucketUrl = `${href}/${environmentConfiguration.aws.s3Bucket}`;
  const publicUrl = `${bucketUrl}/${encodeURIComponent(photoKey)}`;

  return publicUrl;
};

class ImageUploadJob {
  public static async main(
    albumId: number,
    data: {
      imageBuffer: string;
      referenceImageUrl: string;
      searchTime: string;
    }
  ) {
    console.debug(`Performing ImageUploadJob for
	Album ID: ${albumId}
	`);
    const { imageBuffer, referenceImageUrl, searchTime } = data;
    const now = new Date(Date.now()).toISOString();

    // Let's upload the image to S3 and get the public URL for it
    const photoIdentifier = crypto.randomBytes(16).toString("hex");
    const filePublicUrl = await ImageUploadJob.performUpload(
      imageBuffer,
      photoIdentifier
    );

    const queryStartTime = Date.now();
    try {
      await prisma.photos.create({
        data: {
          response_time: searchTime,
          result_image_url: referenceImageUrl,
          search_engine: "Catchoom API",

          updated_at: now,
          created_at: now,

          album_id: albumId,

          searched_image_blob: null,
          searched_image_s3_url: filePublicUrl,
        },
      });

      console.debug(`Successfully created photo record for ${photoIdentifier}`);
    } catch (error) {
      const queryEndTime = Date.now();
      const elapsedSeconds = (queryEndTime - queryStartTime) / 1000;

      console.error(
        `Encountered an error creating photo record ${photoIdentifier} after ${elapsedSeconds} seconds from query start`,
        error
      );
    }
  }

  private static async performUpload(
    imageBufferString: string,
    photoIdentifier: string
  ) {
    const fileName = `${photoIdentifier}.png`;

    // We need to create the buffer from the base64 image string
    const imageBuffer = Buffer.from(imageBufferString, "base64");
    console.debug(`Uploading image ${fileName} to S3 bucket`);

    try {
      await s3Client.putObject({
        ACL: "public-read",
        Bucket: environmentConfiguration.aws.s3Bucket,
        Key: fileName,
        Body: imageBuffer,
        ContentLength: imageBuffer.length,
      });

      // Now that the photo upload has been successful
      // let's generate the S3 URL for it
      const publicUrl = generatePublicUrl(fileName);
      console.debug(`Uploaded image to URL ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error(
        `Encountered an error uploading image ${fileName} to the S3 bucket`,
        error
      );
    }
  }
}

export default ImageUploadJob;
