import { Router } from "express";

import ScanRouter from "./scanRouter";
import ArtworkRouter from "./artworkRouter";
import JobRouter from "./jobRouter";
import BookmarkRouter from "./bookmarkRouter";

const ApiRouter = Router();

ApiRouter.use("/scan", ScanRouter);
ApiRouter.use("/artwork", ArtworkRouter);
ApiRouter.use("/job", JobRouter);
ApiRouter.use("/bookmark", BookmarkRouter);

export default ApiRouter;
