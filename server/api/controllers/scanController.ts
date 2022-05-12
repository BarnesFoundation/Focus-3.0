import express from "express";
import multer from "multer";

export const uploadMiddleware = multer({ dest: "uploads/" });
export const fieldName = "storablePhoto";

class ScanController {
  public static async saveScan(
    request: express.Request,
    response: express.Response
  ) {
    const queryImage = request.file[fieldName];
    const { referenceImageUrl } = request.body;
  }
}

export default ScanController;
