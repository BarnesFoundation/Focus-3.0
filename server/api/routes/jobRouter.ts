import { Router } from "express";

import { JobController } from "../controllers";

const JobRouter = Router();

JobRouter.post("/ElasticSearchSyncJob", JobController.performElasticSearchSync);
JobRouter.post("/SessionClearJob", JobController.performSessionClearJob);
JobRouter.post(
  "/BookmarkDeliveryJob",
  JobController.performBookmarkDeliveryJob
);
JobRouter.post("/StoryDeliveryJob", JobController.performStoryDeliveryJob);
JobRouter.post("/StorySyncJob", JobController.performStorySyncJob);

export default JobRouter;
