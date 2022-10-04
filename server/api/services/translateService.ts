import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import { PrismaClient } from "@prisma/client";

import { environmentConfiguration } from "../../config";

const prisma = new PrismaClient();

const translateClient = new TranslateClient({
  region: environmentConfiguration.aws.region,
});

// This maps the language shortcode to the name
// of the corresponding column in the `translations` table
// that holds the translation data for this language
const LANGUAGE_SHORT_CODE_COLUMN_MAP = {
  en: "english_translation",
  zh: "chinese_translation",
  fr: "french_translation",
  de: "german_translation",
  it: "italian_translation",
  ja: "japanese_translation",
  ko: "korean_translation",
  ru: "russian_translation",
  es: "spanish_translation",
};

export default class TranslateService {
  public static async translate(
    originalText: string,
    targetLanguage: string | null
  ) {
    // No need to translate content if the language is English
    // since content defaults to English. We can't translate empty
    // strings, so short-circuit out of here if there's no content
    if (targetLanguage === "en" || !targetLanguage || !originalText) {
      return originalText;
    }

    try {
      const { TranslatedText } = await translateClient.send(
        new TranslateTextCommand({
          SourceLanguageCode: "en",
          Text: originalText,
          TargetLanguageCode: targetLanguage,
        })
      );
      return TranslatedText;
    } catch (error) {
      console.error(
        `Failed to translate content "${originalText}" to language "${targetLanguage}`,
        error
      );
      return originalText;
    }
  }

  /** Pulls the translations stored in our database for the provided language.
   *
   * These stored translations are for our static (and manually-entered) text
   * used throughout the Focus UI, and not dynamic on-the-fly content
   */
  public static async retrieveStoredTranslations(languageShortcode: string) {
    const translations = {};
    const languageColumnName =
      LANGUAGE_SHORT_CODE_COLUMN_MAP[languageShortcode];

    const parentRecords = await prisma.translations.findMany({
      where: {
        parent_id: null,
      },
      orderBy: {
        display_order: "asc",
      },
    });

    for (let i = 0; i < parentRecords.length; i++) {
      const parentRecord = parentRecords[i];
      const header = stripTab(parentRecord.screen_text);
      translations[header] = {};

      const parentRecordId = parseInt(parentRecord.id.toString());
      const childRecords = await prisma.translations.findMany({
        where: {
          parent_id: parentRecordId,
        },
        orderBy: {
          unique_identifier: "asc",
        },
      });

      for (let j = 0; j < childRecords.length; j++) {
        const childRecord = childRecords[j];

        translations[header][childRecord.unique_identifier] = {
          screen_text: stripTab(childRecord.screen_text),

          // Get the content translated into the language we specified
          // If not available, we'll just return the english translation
          // though this should never occur
          translated_content: childRecord[languageColumnName]
            ? stripTab(childRecord[languageColumnName])
            : stripTab(childRecord["english_translation"]),
        };
      }
    }

    return translations;
  }

  /** Iterates through content blocks and translates necessary content */
  public static async translateContent(content, targetLanguage: string | null) {
    // No need to translate content if the language is English
    // since content defaults to English. We can't translate empty
    // arrays, so short-circuit out of here if there's no content
    if (targetLanguage === "en" || !targetLanguage || !content.length) {
      return content;
    }

    try {
      const translatedContent = content.map(async (cb) => {
        const contentBlock = cb["contentBlock"].map(async (block) => {
          const translatedBlock = { ...block };

          switch (block.type) {
            case "Image":
              translatedBlock["caption"]["html"] = await this.translate(
                block["caption"]["html"],
                targetLanguage
              );
              translatedBlock["altText"] = await this.translate(
                block["altText"],
                targetLanguage
              );
              break;

            case "ImageComparison":
              translatedBlock["leftImage"]["caption"]["html"] =
                await this.translate(
                  block["leftImage"]["caption"]["html"],
                  targetLanguage
                );
              translatedBlock["rightImage"]["altText"] = await this.translate(
                block["rightImage"]["altText"],
                targetLanguage
              );
              translatedBlock["rightImage"]["caption"]["html"] =
                await this.translate(
                  block["rightImage"]["caption"]["html"],
                  targetLanguage
                );
              translatedBlock["rightImage"]["altText"] = await this.translate(
                block["rightImage"]["altText"],
                targetLanguage
              );
              break;

            case "TextBlock":
              translatedBlock["textBlock"]["html"] = await this.translate(
                block["textBlock"]["html"],
                targetLanguage
              );
              break;

            case "Title":
              translatedBlock["title"] = await this.translate(
                block["title"],
                targetLanguage
              );
              translatedBlock["subtitle"] = await this.translate(
                block["subtitle"],
                targetLanguage
              );
              break;

            default:
              break;
          }

          return translatedBlock;
        });

        const translatedContentBlock = await Promise.all(contentBlock);
        return { contentBlock: translatedContentBlock };
      });

      return await Promise.all(translatedContent);
    } catch (error) {
      console.error(
        `Failed to translate content block to language "${targetLanguage}`,
        error
      );
      return content;
    }
  }
}

const stripTab = (theString: string) => theString.replace(/\t/g, "");
