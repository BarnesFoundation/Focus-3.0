import express from "express";

import { ArtworkService, GraphCMSService } from "../services";

export const fieldName = "storablePhoto";

class ArtworkController {
  public static async getInformation(
    request: express.Request,
    response: express.Response
  ) {
    const artworkId = request.params.artworkId;
    const artworkInformation = await ArtworkService.getInformation(artworkId);

    if (artworkInformation) {
      const storyInformation = await GraphCMSService.hasStory(artworkId);

      const responseObject = {
        data: {
          records: [artworkInformation],
          roomRecords: null,
          message: "Result found",
          showStory: storyInformation.hasStory,
        },
        success: true,
        requestComplete: true,
      };

      // If this artwork has a story, then we want to track
      // that the user has viewed this artwork and increment
      // the number of times they've viewed the story within their session
      if (storyInformation.hasStory) {
      }

      return response.status(200).json(responseObject);
    }

    return response
      .status(400)
      .json(`No artwork found for provided id ${artworkId}`);
  }

  public static async findAndTrackViewedStory(
    request: express.Request,
    response: express.Response
  ) {}
}

export default ArtworkController;
