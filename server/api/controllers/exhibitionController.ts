import express from "express";
import { PrismaClient } from "@prisma/client";

import { ArtworkService, TranslateService } from "../services";

export const fieldName = "storablePhoto";
const prisma = new PrismaClient();

class ExhibitionController {
  public static async getObjectInfo(
    request: express.Request,
    response: express.Response
  ) {
    const objectId = request.params.objectId;
    const objectData = await ArtworkService.findSpecialExhibitionObject(
      objectId
    );

    // Manipulate the data to have save key/pairs as the ES results
    objectData[0]["art_url"] = objectData[0].image.url;
    objectData[0]["id"] = objectData[0].objectId;

    const session = request.session;
    const preferredLanguage = session.lang_pref;

    // Translate the content
    objectData[0]["shortDescription"] = await TranslateService.translate(
      objectData[0]["shortDescription"],
      preferredLanguage
    );

    objectData[0]["content"] = await ArtworkService.getCmsContentTranslations(
      objectData[0]["content"],
      preferredLanguage
    );

    const responseObject = {
      data: {
        records: objectData,
        roomRecords: null,
        message: "Result found",
        // TODO: Implement stories for special exhibition objects
        // showStory: storyInformation.hasStory,
        showStory: false,
        specialExhibition: true,
      },
      success: true,
      requestComplete: true,
    };

    return response.status(200).json(responseObject);
  }
}

export default ExhibitionController;
