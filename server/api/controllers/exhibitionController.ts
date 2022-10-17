import express from "express";

import { ArtworkService, TranslateService } from "../services";

export const fieldName = "storablePhoto";

class ExhibitionController {
  public static async getObjectInfo(
    request: express.Request,
    response: express.Response
  ) {
    const objectId = request.params.objectId;
    const preferredLanguage = request.query.lang
      ? request.query.lang.toString().toLowerCase()
      : request.session.lang_pref
      ? request.session.lang_pref
      : "en";

    // If lang preference has changed, update session
    if (request.session.lang_pref !== preferredLanguage) {
      request.session.lang_pref = preferredLanguage;
    }

    const objectData = await ArtworkService.findSpecialExhibitionObject(
      objectId
    );
    // If content for object was found in Hygraph, translate and format the data
    if (objectData.length) {
      // Manipulate the data to have save key/pairs as the ES results
      objectData[0]["art_url"] = objectData[0].image.url;
      objectData[0]["id"] = objectData[0].objectId;

      const session = request.session;

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
    // Otherwise content was not found for the object
    else {
      return response
        .status(404)
        .json({ data: { records: [] }, success: false, requestComplete: true });
    }
  }
}

export default ExhibitionController;
