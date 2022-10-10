import express from "express";

import {
  ElasticSearchSyncJob,
  StorySyncJob,
  SessionClearJob,
  BookmarkDeliveryJob,
  StoryDeliveryJob,
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

  public static async performBookmarkDeliveryJob(
    request: express.Request,
    response: express.Response
  ) {
    await BookmarkDeliveryJob.main();
    return response
      .status(200)
      .json(`BookmarkDeliveryJob completed successfully.`);
  }

  public static async performStoryDeliveryJob(
    request: express.Request,
    response: express.Response
  ) {
    await StoryDeliveryJob.main();
    return response
      .status(200)
      .json(`StoryDeliveryJob completed successfully.`);
  }
}

export default JobController;
