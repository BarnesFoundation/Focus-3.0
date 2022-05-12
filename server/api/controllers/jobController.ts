import express from "express";

import { ElasticSearchSyncJob } from "../jobs";

class JobController {
  public static async performElasticSearchSync(
    request: express.Request,
    response: express.Response
  ) {
    await ElasticSearchSyncJob.main();
    response.status(200).json("Job completed successfully");
  }
}

export default JobController;
