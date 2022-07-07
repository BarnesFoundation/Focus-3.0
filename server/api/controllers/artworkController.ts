import express from "express";

import { ArtworkService, GraphCMSService, TranslateService } from "../services";

export const fieldName = "storablePhoto";

class ArtworkController {
  public static async getInformation(
    request: express.Request,
    response: express.Response
  ) {
    const artworkId = request.params.artworkId;
    const artworkInformation = await ArtworkService.getInformation(artworkId);
    const preferredLanguage = request.session.lang_pref;

    if (artworkInformation) {
      // Fetch the story and translate the content if needed
      const storyInformation = await GraphCMSService.hasStory(artworkId);
      /* artworkInformation["shortDescription"] = await TranslateService.translate(
        artworkInformation["shortDescription"],
        preferredLanguage
      ); */

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
        const readStoryId = storyInformation.storyId;

        // If this is the first time the user has encountered this story
        // we'll initialize the number of times it's been read
        if (request.session.blob.hasOwnProperty(readStoryId) === false) {
          request.session.blob[readStoryId] = {
            read_count: 0,
          };
        }

        // Increment the existing count every time the story has been read
        request.session.blob[readStoryId].read_count += 1;
      }

      return response.status(200).json(responseObject);
    }

    return response
      .status(400)
      .json(`No artwork found for provided id ${artworkId}`);
  }

  public static async retrieveStories(
    request: express.Request,
    response: express.Response
  ) {
    const session = request.session;
    const artworkId = request.params.artworkId;

    // const languagePreference = session.lang_pref;
    const storiesData = await ArtworkService.findStoryForArtwork(artworkId);

    return response.status(200).json(storiesData);
  }
}

export default ArtworkController;
