import { Router } from "express";

import { TranslationController } from "../controllers";

const TranslationRouter = Router();

TranslationRouter.get("/", TranslationController.getCannedTranslations);

export default TranslationRouter;
