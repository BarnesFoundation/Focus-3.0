import { Router } from "express";

import { BookmarkController } from "../controllers";

const BookmarkRouter = Router();

BookmarkRouter.post("/set-language");

export default BookmarkRouter;
