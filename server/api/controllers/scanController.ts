import express from "express";
import multer from "multer";
import vuforia from "vuforia-api";

import { ImageUploadJob } from "../jobs";
import { DatabaseService } from "../services";

const prisma = DatabaseService.instance;

export const uploadMiddleware = multer({ storage: multer.memoryStorage() });
export const fieldName = "image";

const TRUE = "true";
const FALSE = "false";

type NullString = "null";
type TrueString = typeof TRUE;
type FalseString = typeof FALSE;

interface NoFoundImageScan {
  token: string;
  scanSeqId: string;
  searchSuccess: FalseString;
  referenceImageUrl: NullString;
  esResponse: NullString;
  searchTime: NullString;
}

interface FoundImageScan {
  token: string;
  scanSeqId: string;
  searchSuccess: TrueString;
  referenceImageUrl: string;
  esResponse: string;
  searchTime: string;
}

interface TypedRequest extends express.Request {
  body: FoundImageScan | NoFoundImageScan;
}

interface VuforiaResponse {
  query_id: string;
  results: Array<{
    target_id: string;
    target_data: {
      name: string;
      application_metadata: any;
      target_timestamp: number;
    };
  }>;
  result_code: string;
}

const vuforiaClient = vuforia.client({
  // We're not using server credentials because we're not making use of the Management API
  serverAccessKey: "",
  serverSecretKey: "",

  clientAccessKey: process.env.REACT_APP_VUFORIA_CLIENT_ACCESS_KEY,
  clientSecretKey: process.env.REACT_APP_VUFORIA_CLIENT_SECRET_KEY,
});

class ScanController {
  public static async saveScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const now = new Date(Date.now()).toISOString();
    const sessionId = request.sessionID;
    const queryImage = request.file.buffer.toString("base64");

    let referenceImageUrl =
      request.body.searchSuccess === TRUE
        ? request.body.referenceImageUrl
        : null;

    // We shouldn't be receiving a `referenceImageUrl` that is the string `null`
    if (referenceImageUrl === "null") {
      console.warn(`Reference Image URL is "null" string
	   Session ID: ${sessionId}
	   Search Success: ${request.body.searchSuccess} 
	  `);

      referenceImageUrl = null;
    }

    // Look up the album for this session and scan sequence
    let sessionAlbum = await prisma.albums.findFirst({
      where: {
        unique_identifier: request.body.scanSeqId,
        session_id: sessionId,
      },
    });

    // If none exists, we'll create it
    if (!sessionAlbum) {
      sessionAlbum = await prisma.albums.create({
        data: {
          session_id: sessionId,
          unique_identifier: request.body.scanSeqId,

          updated_at: now,
          created_at: now,
        },
      });
    }

    // We'll respond to the client that we've received their request
    // to store the image and close the connection with them
    response.status(200).json("Request to store image received");

    // We'll proceed with the image upload, no longer impacting the
    // client's connection as it should be ended by now
    await ImageUploadJob.main(parseInt(sessionAlbum.id.toString()), {
      imageBuffer: queryImage,
      searchTime: request.body.searchTime,
      referenceImageUrl,
    });
  }

  public static async searchScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const queryImage = request.file;
    const imageBinary = queryImage.buffer.toString("binary");

    try {
      const imageSearchResult = await new Promise<VuforiaResponse>(
        (resolve, reject) => {
          vuforiaClient.cloudRecoQuery(
            imageBinary,
            5,
            function (error, result) {
              if (error) {
                return reject(error);
              } else {
                return resolve(result);
              }
            }
          );
        }
      );

      console.debug(
        "Successful Vuforia API image search result",
        JSON.stringify(imageSearchResult)
      );

      // Transform the result into a format similar to how CraftAR was providing us
      // so that we can continue to utilize the FE as-is without any changes for now
      const transformedResult = {
        search_time: Date.now(),
        results: imageSearchResult.results
          // Not sure why some items in this list come back with no `target_data` key
          // If there is no `target_data` key then we don't get a `name` value
          .filter((result) => result.target_id && result.target_data)
          .map((result) => ({
            item: {
              name: result.target_data?.name,
            },
            image: {
              thumb_120: "null",
            },
          })),
      };

      return response.status(200).json(transformedResult);
    } catch (error) {
      console.log(`An error occurred sending request to Vueforia`, error);
      return response.status(500).json({
        message: "An error occurrend sending performing image search request",
      });
    }
  }
}

export default ScanController;
