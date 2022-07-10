import express from "express";
import multer from "multer";

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

class ScanController {
  public static async saveScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const queryImage = request.file;

    if (request.body.searchSuccess === TRUE) {
      const requestBody = request.body;
    } else {
      const requestBody = request.body;
      return response.status(200).json("image");
    }
  }
}

export default ScanController;
