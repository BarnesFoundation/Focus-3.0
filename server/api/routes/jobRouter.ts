import { Router } from "express";

import { JobController } from "../controllers";

const JobRouter = Router();

JobRouter.post("/ElasticSearchSyncJob", JobController.performElasticSearchSync);
JobRouter.post("/ImageUploadJob", JobController.performImageUploadJob);
JobRouter.post("/SessionClearJob", JobController.performSessionClearJob);
JobRouter.post(
  "/BookmarkDeliveryJob",
  JobController.performBookmarkDeliveryJob
);

export default JobRouter;
