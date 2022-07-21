import express from "express";

import { ElasticSearchSyncJob, StorySyncJob, ImageUploadJob } from "../jobs";

class JobController {
  public static async performElasticSearchSync(
    request: express.Request,
    response: express.Response
  ) {
    await ElasticSearchSyncJob.main();
    return response
      .status(200)
      .json("Elastic Search Sync Job completed successfully");
  }

  public static async performStorySyncJob(
    request: express.Request,
    response: express.Response
  ) {
    await StorySyncJob.main();
    return response.status(200).json("Story Sync Job completed successfully");
  }

  public static async performImageUploadJob(
    request: express.Request,
    response: express.Response
  ) {
    const [albumId, photoId] = request.body;
    await ImageUploadJob.main(albumId, photoId);
    return response.status(200).json("ImageUploadJob completed successfully");
  }
}

export default JobController;
