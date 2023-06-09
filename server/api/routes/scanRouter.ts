import { Router } from "express";

import { ScanController, uploadMiddleware, fieldName } from "../controllers";

const ScanRouter = Router();

ScanRouter.post(
  "/save",
  uploadMiddleware.single(fieldName),
  ScanController.saveScan
);

ScanRouter.post(
  "/search",
  uploadMiddleware.single(fieldName),
  ScanController.searchScan
);

export default ScanRouter;
