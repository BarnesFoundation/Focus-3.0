import { Router } from "express";

import ScanRouter from "./scanRouter";
import ArtworkRouter from "./artworkRouter";
import JobRouter from "./jobRouter";
import BookmarkRouter from "./bookmarkRouter";
import TranslationRouter from "./translationsRouter";
import StoryRouter from "./storyRouter";
import ExhibitionRouter from "./exhibitionRouter";

const ApiRouter = Router();

ApiRouter.use("/scan", ScanRouter);
ApiRouter.use("/artwork", ArtworkRouter);
ApiRouter.use("/job", JobRouter);
ApiRouter.use("/bookmark", BookmarkRouter);
ApiRouter.use("/translation", TranslationRouter);
ApiRouter.use("/stories", StoryRouter);
ApiRouter.use("/exhibition", ExhibitionRouter)

export default ApiRouter;
