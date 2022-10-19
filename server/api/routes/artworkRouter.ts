import { Router } from "express";

import { ArtworkController } from "../controllers";
import { captureScannedHistoryMiddleware } from "../middleware";

const ArtworkRouter = Router();

ArtworkRouter.get(
  "/:artworkId",
  captureScannedHistoryMiddleware,
  ArtworkController.getInformation
);
ArtworkRouter.get("/:artworkId/stories", ArtworkController.retrieveStories);
ArtworkRouter.post(
  "/:artworkId/stories/:storyId/read",
  ArtworkController.markStoryAsRead
);

export default ArtworkRouter;
