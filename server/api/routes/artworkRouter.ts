import { Router } from "express";

import { ArtworkController } from "../controllers";

const ArtworkRouter = Router();

ArtworkRouter.get("/:artworkId", ArtworkController.getInformation);
ArtworkRouter.get("/:artworkId/stories", ArtworkController.retrieveStories);

export default ArtworkRouter;
