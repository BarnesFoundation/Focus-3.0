import express from "express";

import { ElasticSearchSyncJob, StorySyncJob } from "../jobs";

class JobController {
  public static async performElasticSearchSync(
    request: express.Request,
    response: express.Response
  ) {
    await ElasticSearchSyncJob.main();
    response.status(200).json("Elastic Search Sync Job completed successfully");
  }

  public static async performStorySyncJob(
    request: express.Request,
    response: express.Response
  ) {
    await StorySyncJob.main();
    response.status(200).json("Story Sync Job completed successfully");
  }
}

export default JobController;
