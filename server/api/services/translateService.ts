import { v2 } from "@google-cloud/translate";

import { environmentConfiguration } from "../../config";

const { Translate } = v2;

const projectId = environmentConfiguration.google.projectId;
const Translator = new Translate({ projectId });

export default class TranslateService {
  public static async translate(
    text: string,
    targetLanguage: string | null,
    cacheKey?: string
  ) {
    // No need to translate content if the language is English
    // since the context is already in English
    if (targetLanguage === "en" || !targetLanguage) {
      return text;
    }

    try {
      const translatedText = await Translator.translate(text, targetLanguage);
      return translatedText;
    } catch (error) {
      console.error(
        `Failed to translate context "${text}" to language "${targetLanguage}`,
        error
      );
      return text;
    }
  }
}
