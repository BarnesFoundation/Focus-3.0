import { Router } from "express";

import { ExhibitionController } from "../controllers";
import { captureScannedHistoryMiddleware } from "../middleware";

const ExhibitionRouter = Router();

ExhibitionRouter.get(
  "/:objectId",
  captureScannedHistoryMiddleware,
  ExhibitionController.getObjectInfo
);

export default ExhibitionRouter;
