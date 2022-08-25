import { Router } from "express";

import { StoryController } from "../controllers";

const StoryRouter = Router();

StoryRouter.get("/:storyTitleSlug", StoryController.getStoryContent);

export default StoryRouter;
