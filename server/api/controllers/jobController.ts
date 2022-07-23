import express from "express";

import {
  ElasticSearchSyncJob,
  StorySyncJob,
  ImageUploadJob,
  SessionClearJob,
} from "../jobs";

class JobController {
  public static async performElasticSearchSync(
    request: express.Request,
    response: express.Response
  ) {
    await ElasticSearchSyncJob.main();
    return response
      .status(200)
      .json("ElasticSearchSyncJob completed successfully");
  }

  public static async performStorySyncJob(
    request: express.Request,
    response: express.Response
  ) {
    await StorySyncJob.main();
    return response.status(200).json("StorySyncJob completed successfully");
  }

  public static async performImageUploadJob(
    request: express.Request,
    response: express.Response
  ) {
    const [albumId, photoId] = request.body;
    await ImageUploadJob.main(albumId, photoId);
    return response.status(200).json("ImageUploadJob completed successfully");
  }

  public static async performSessionClearJob(
    request: express.Request,
    response: express.Response
  ) {
    const clearedSessionsCount = await SessionClearJob.main();
    return response
      .status(200)
      .json(
        `SessionClearJob completed successfully. ${clearedSessionsCount} expired sessions cleared`
      );
  }
}

export default JobController;
