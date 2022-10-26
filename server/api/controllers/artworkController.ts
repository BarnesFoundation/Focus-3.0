import { getPreferredLanguage } from "api/utils";
import express from "express";

import {
  ArtworkService,
  GraphCMSService,
  TranslateService,
  DatabaseService,
} from "../services";
import { generateImgixUrl } from "../utils/generateImgixUrl";

export const fieldName = "storablePhoto";
const prisma = DatabaseService.instance;

class ArtworkController {
  public static async getInformation(
    request: express.Request,
    response: express.Response
  ) {
    const artworkId = request.params.artworkId;
    const preferredLanguage = getPreferredLanguage(request);
    const artworkInformation = await ArtworkService.getInformation(artworkId);

    if (artworkInformation) {
      // Fetch the story and content
      const { collectionObjects, storyInformation } =
        await GraphCMSService.findContentAndStories(
          artworkId,
          artworkInformation["invno"]
        );

      // Translate the short description
      artworkInformation["shortDescription"] = await TranslateService.translate(
        artworkInformation["shortDescription"],
        preferredLanguage
      );

      if (collectionObjects) {
        artworkInformation["content"] =
          await ArtworkService.getCmsContentTranslations(
            collectionObjects["content"],
            preferredLanguage
          );
      }

      // Add the Imgix URL for the artwork
      artworkInformation["art_url"] = generateImgixUrl(
        artworkId,
        artworkInformation["imageSecret"]
      );

      const responseObject = {
        data: {
          records: [artworkInformation],
          roomRecords: null,
          message: "Result found",
          showStory: storyInformation.hasStory,
          specialExhibition: false,
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
    const artworkId = request.params.artworkId;
    const languagePreference = getPreferredLanguage(request);

    const relatedStories = await GraphCMSService.findByObjectId(
      artworkId,
      languagePreference
    );

    return response.status(200).json({ data: relatedStories });
  }

  public static async markStoryAsRead(
    request: express.Request,
    response: express.Response
  ) {
    const artworkId = request.params.artworkId;
    const storyId = request.params.storyId;
    const sessionId = request.sessionID;

    // Look up the bookmark for this artwork for the user
    const bookmarks = await prisma.bookmarks.findMany({
      where: {
        image_id: artworkId,
        session_id: sessionId,
      },
    });

    if (bookmarks.length > 0 && request.session.blob.hasOwnProperty(storyId)) {
      request.session.blob[storyId].read = true;
      await prisma.bookmarks.updateMany({
        where: {
          image_id: artworkId,
          session_id: sessionId,
        },
        data: { story_read: true },
      });

      return response.status(200).json({
        data: {
          success: true,
        },
        message: "Story has been marked as read successfully!",
      });
    }

    // Otherwise, somehow there's no bookmark entry for any artworks related to this story
    else {
      return response.status(404).json({
        data: {
          success: false,
        },
        message: "Entry not found!",
      });
    }
  }
}

export default ArtworkController;
