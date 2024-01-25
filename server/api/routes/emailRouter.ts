import { Router } from "express";

import { EmailController } from "../controllers";

const EmailRouter = Router();

EmailRouter.get("/story/:sessionId", EmailController.getStoryEmail);
EmailRouter.get("/bookmark/:sessionId", EmailController.getBookmarkEmail);

export default EmailRouter;
