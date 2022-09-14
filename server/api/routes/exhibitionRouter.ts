import { Router } from "express";

import { ExhibitionController } from "../controllers";

const ExhibitionRouter = Router();

ExhibitionRouter.get("/:objectId", ExhibitionController.getObjectInfo);

export default ExhibitionRouter;
