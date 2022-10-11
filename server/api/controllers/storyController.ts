import { PrismaClient } from "@prisma/client";
import { GraphCMSService } from "../services";
import express from "express";

const prisma = new PrismaClient();

class StoryController {
  public static async getStoryContent(
    request: express.Request,
    response: express.Response
  ) {
    const storyTitleSlug = request.params.storyTitleSlug;
    const languagePreference =
      request.query.lang.toString() || request.session.lang_pref || "en";

    const foundStory = await prisma.stories.findFirst({
      where: {
        slug: storyTitleSlug,
      },
    });

    const parsedStoryContent = await GraphCMSService.findByTitle(
      foundStory.title,
      languagePreference
    );

    if (parsedStoryContent) {
      return response.status(200).json({
        data: {
          success: true,
          total: parsedStoryContent.total,
          unique_identifier: parsedStoryContent.unique_identifier,
          content: parsedStoryContent.content,
        },
        message: "Ok",
      });
    }

    return response.status(404).json({
      data: {
        success: false,
        total: 0,
        unique_identifier: null,
        content: {},
      },
      message: "Story not found!",
    });
  }
}

export default StoryController;
