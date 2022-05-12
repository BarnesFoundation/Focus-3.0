import { Router } from "express";

import ScanRouter from "./scanRouter";
import ArtworkRouter from "./artworkRouter";
import JobRouter from "./jobRouter";

const ApiRouter = Router();

ApiRouter.use("/scan", ScanRouter);
ApiRouter.use("/artwork", ArtworkRouter);
ApiRouter.use("/job", JobRouter);

export default ApiRouter;
