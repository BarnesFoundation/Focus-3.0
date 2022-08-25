import { Router } from "express";

import ScanRouter from "./scanRouter";
import ArtworkRouter from "./artworkRouter";
import JobRouter from "./jobRouter";
import BookmarkRouter from "./bookmarkRouter";
import TranslationRouter from "./translationsRouter";
import StoryRouter from "./storyRouter";

const ApiRouter = Router();

ApiRouter.use("/scan", ScanRouter);
ApiRouter.use("/artwork", ArtworkRouter);
ApiRouter.use("/job", JobRouter);
ApiRouter.use("/bookmark", BookmarkRouter);
ApiRouter.use("/translation", TranslationRouter);
ApiRouter.use("/stories", StoryRouter);

export default ApiRouter;
