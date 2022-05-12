import { Router } from "express";

import { JobController } from "../controllers";

const JobRouter = Router();

JobRouter.post("/elasticsearch-sync", JobController.performElasticSearchSync);

export default JobRouter;
