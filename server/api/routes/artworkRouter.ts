import { Router } from "express";

import { ArtworkController } from "../controllers";

const ArtworkRouter = Router();

ArtworkRouter.get("/:artworkId", ArtworkController.getInformation);

export default ArtworkRouter;
