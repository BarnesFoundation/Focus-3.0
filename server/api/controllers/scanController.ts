import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { promisify } from "util";

import { ImageUploadJob } from "../jobs";

const prisma = new PrismaClient();

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

class ScanController {
  public static async saveScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const now = new Date(Date.now()).toISOString();
    const sessionId = request.sessionID;
    const queryImage = request.file;

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

    // Once we've created the album for the session
    // we can create photos related to this album
    const createdAlbumPhoto = await prisma.photos.create({
      data: {
        es_response: request.body.esResponse,
        response_time: request.body.searchTime,
        result_image_url: referenceImageUrl,
        search_engine: "Catchoom API",

        updated_at: now,
        created_at: now,

        album_id: sessionAlbum.id,
      },
    });

    // We'll respond to the client that we've received their request
    // to store the image and close the connection
    response.status(200).json("Request to store image received");

    // We'll proceed with the image upload, no longer impacting the
    // client's connection as it should be ended by now
    await ImageUploadJob.main(
      parseInt(sessionAlbum.id.toString()),
      parseInt(createdAlbumPhoto.id.toString()),
      queryImage
    );
  }
}

export default ScanController;
