import express from "express";
import { PrismaClient } from "@prisma/client";

import { ArtworkService, GraphCMSService, TranslateService } from "../services";

export const fieldName = "storablePhoto";
const prisma = new PrismaClient();

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

    return response.status(200).json({ data: storiesData });
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
