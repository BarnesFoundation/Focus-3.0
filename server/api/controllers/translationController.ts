import { getPreferredLanguage } from "../utils";
import express from "express";

import { TranslateService } from "../services";

class TranslationController {
  public static async getCannedTranslations(
    request: express.Request,
    response: express.Response
  ) {
    const languagePreference = getPreferredLanguage(request);

    const storedTranslations =
      await TranslateService.retrieveStoredTranslations(languagePreference);

    return response.status(200).json({
      data: {
        translations: storedTranslations,
      },
      message: "",
    });
  }
}

export default TranslationController;
