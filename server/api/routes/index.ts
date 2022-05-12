import { Router } from "express";

import ScanRouter from "./scanRouter";
import ArtworkRouter from "./artworkRouter";

const ApiRouter = Router();

ApiRouter.use("/scan", ScanRouter);
ApiRouter.use("/artwork", ArtworkRouter);

export default ApiRouter;
