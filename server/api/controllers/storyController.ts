import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

class StoryController {
  public static async getCannedTranslations(
    request: express.Request,
    response: express.Response
  ) {
    const storyTitleSlug = request.params.storyTitleSlug;
    const language = request.params.lang || request.session.lang_pref || "en";

    const foundStory = await prisma.stories.findFirst({
      where: {
        slug: storyTitleSlug,
      },
    });

    if (foundStory) {
      return response.status(200).json({
        data: {
          success: true,
          total: 0,
          unique_identifier: null,
          content: {},
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
