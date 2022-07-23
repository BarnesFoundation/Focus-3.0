import { Router } from "express";

import { JobController } from "../controllers";

const JobRouter = Router();

JobRouter.post("/ElasticSearchSyncJob", JobController.performElasticSearchSync);
JobRouter.post("/ImageUploadJob", JobController.performImageUploadJob);
JobRouter.post("/SessionClearJob", JobController.performSessionClearJob);

export default JobRouter;
