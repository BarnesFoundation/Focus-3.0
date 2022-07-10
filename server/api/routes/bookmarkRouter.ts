import { Router } from "express";

import { BookmarkController } from "../controllers";

const BookmarkRouter = Router();

BookmarkRouter.post("/submit", BookmarkController.submitEmail);
BookmarkRouter.post("/set-language", BookmarkController.setLanguagePreference);

export default BookmarkRouter;
