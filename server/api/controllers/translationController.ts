import express from "express";

import { TranslateService } from "../services";

class TranslationController {
  public static async getCannedTranslations(
    request: express.Request,
    response: express.Response
  ) {
    const languagePreference = request.query.lang
      ? request.query.lang.toString().toLowerCase()
      : request.session.lang_pref
      ? request.session.lang_pref
      : "en";

    // If lang preference has changed, update session
    if (request.session.lang_pref !== languagePreference) {
      request.session.lang_pref = languagePreference.toLowerCase();
    }

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
