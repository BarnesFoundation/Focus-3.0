import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { promisify } from "util";

import { ImageUploadJob } from "../jobs";

const prisma = new PrismaClient();

export const uploadMiddleware = multer({ dest: "uploads/" });
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

const unlinkAsync = promisify(fs.unlink);

class ScanController {
  public static async saveScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const now = new Date(Date.now()).toISOString();
    const sessionId = request.sessionID as any;
    const queryImage = request.file;
    const referenceImageUrl =
      request.body.searchSuccess === TRUE
        ? request.body.referenceImageUrl
        : null;

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
        searched_image_blob: queryImage.buffer.toString("base64"),
        es_response: request.body.esResponse,
        response_time: request.body.searchTime,
        result_image_url: referenceImageUrl,
        search_engine: "Catchoom API",

        updated_at: now,
        created_at: now,
      },
    });

    // We'll queue the actual upload for this image to S3
    await ImageUploadJob.performLater(
      parseInt(sessionAlbum.id.toString()),
      parseInt(createdAlbumPhoto.id.toString())
    );

    // Delete the Multer file from our local storage
    await unlinkAsync(queryImage.path);

    response.status(200).json("Image was stored");
  }
}

export default ScanController;
