import { Router } from "express";

import { ArtworkController } from "../controllers";

const StoryRouter = Router();

StoryRouter.get("/:storyTitleSlug", ArtworkController.getInformation);

export default StoryRouter;
