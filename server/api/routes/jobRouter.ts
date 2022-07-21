import { Router } from "express";

import { JobController } from "../controllers";

const JobRouter = Router();

JobRouter.post("/elasticsearch-sync", JobController.performElasticSearchSync);
JobRouter.post("/ImageUploadJob", JobController.performImageUploadJob);

export default JobRouter;
