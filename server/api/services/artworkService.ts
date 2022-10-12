import DatabaseService from "./databaseService";
import ElasticSearchService from "./elasticSearchService";
import GraphCMSService, { RelatedStory, ObjectID } from "./graphCMSService";
import Config from "../../config";
import { slugify } from "../utils";

import { generateImgixUrl } from "../utils/generateImgixUrl";
import TranslateService from "./translateService";

const prisma = DatabaseService.instance;

// Unique separator to separate strings of content to be translated
const UNIQUE_SEPARATOR = "***";

/** Class responsible for performing functions related to an artwork
 * such as
 * - retrieving meta information for the artwork
 * - stories related to the artwork
 * - find images similar or visually related to an artwork
 */
export default class ArtworkService {
  public static async getInformation(artworkId: string) {
    const record = await prisma.es_cached_records.findFirst({
      where: { image_id: artworkId },
      select: {
        es_data: true,
      },
    });

    // If there's a record for this id, we'll return it immediately
    if (record) {
      return record.es_data;
    }

    // Otherwise, no record found for the id, so we'll pull it
    // from ElasticSearch and persist it in our local records cache
    console.info(
      `No record found for "image_id": ${artworkId}. Attempting to create new record`
    );

    const now = new Date(Date.now()).toISOString();
    const recordFromElasticSearch = await ElasticSearchService.getObject(
      artworkId
    );

    if (recordFromElasticSearch) {
      const artwork = await prisma.es_cached_records.create({
        data: {
          es_data: recordFromElasticSearch,
          image_id: artworkId,

          created_at: now,
          updated_at: now,
        },
      });

      return artwork.es_data;
    }

    console.info(
      `Could not find record for "image_id": ${artworkId} for creation`
    );
    return null;
  }

  private static extractStoryInformation(
    storyFields: RelatedStory,
    objectId: string
  ): Array<ExtractedStoryInformation> {
    const stories = [...Array(6)]
      .map((_, i) => {
        const index = i + 1;
        const identifier = `objectID${index}` as ObjectID;

        if (!storyFields[identifier]) {
          return null;
        }

        const imageId =
          "objectID1" === identifier && objectId === storyFields[identifier]
            ? storyFields["alternativeHeroImageObjectID"]
            : storyFields[identifier];

        return {
          image_id: imageId,
          short_paragraph: storyFields[`shortParagraph${index}`],
          long_paragraph: storyFields[`longParagraph${index}`],
          detail: null,
        };
      })
      .filter((el) => el);

    return stories;
  }

  private static async getStoriesDetail(
    stories: Array<ExtractedStoryInformation>,
    artworks: Array<Artwork>,
    languagePreference: string
  ) {
    // For each story, we want to grab the artwork detail for it
    const storiesWithDetail = stories.map((story) => {
      const detailForStory = artworks.find(
        (artwork) =>
          parseInt(artwork.id.toString()) === parseInt(story.image_id)
      );

      if (detailForStory) {
        story["detail"] = detailForStory;
      }

      return story;
    });

    // We also want to translate the paragraph content for the story
    // We'll iterate through the stories and collect the content
    // and merge it into a single string (so as to do a single translate call)
    const contentForTranslation = storiesWithDetail.reduce((acc, el) => {
      const { short_paragraph } = el;
      const translatableString = short_paragraph["html"];

      return acc + UNIQUE_SEPARATOR + translatableString;
    }, "");

    const translatedContent = await TranslateService.translate(
      contentForTranslation,
      languagePreference
    );

    // Now that we have the translated story content
    // we should map it back to the story it came from
    translatedContent
      .split(UNIQUE_SEPARATOR)
      .filter((el) => el)
      .forEach((content, index) => {
        storiesWithDetail[index].short_paragraph.html = content;
      });

    return storiesWithDetail;
  }

  public static async parseRelatedStory(
    relatedStories: Array<RelatedStory>,
    artworkId: string | null,
    languagePreference: string
  ): Promise<ParsedRelatedStory> {
    if (relatedStories.length === 0) {
      return {
        content: {},
        total: 0,
        unique_identifier: "",
      };
    }

    const storyFields =
      relatedStories.length > 1
        ? relatedStories[relatedStories.length - 1]
        : relatedStories[0];
    const stories = ArtworkService.extractStoryInformation(
      storyFields,
      artworkId
    );
    const storyArtworkIds = stories.map((story) => story.image_id);
    const artworks = (
      await prisma.es_cached_records.findMany({
        select: { es_data: true, image_id: true },
        where: {
          image_id: { in: storyArtworkIds },
        },
      })
    ).map<Artwork>(
      ({ es_data, image_id }: { es_data: unknown; image_id: string }) => {
        const artworkInformation = es_data as Artwork;
        return {
          ...artworkInformation,
          art_url: generateImgixUrl(image_id, es_data["imageSecret"]),
        };
      }
    );

    const translatedTitle = await TranslateService.translate(
      storyFields.storyTitle,
      languagePreference
    );

    const titleSlug = slugify(storyFields.storyTitle);

    return {
      content: {
        story_title: translatedTitle,

        original_story_title: storyFields.storyTitle,

        stories: await ArtworkService.getStoriesDetail(
          stories,
          artworks,
          languagePreference
        ),
      },
      unique_identifier: storyFields.id,
      total: stories.length,

      translated_title: translatedTitle,
      link: `${Config.assetHost}/story/${titleSlug}`,
    };
  }

  public static async findSpecialExhibitionObject(objectId: string) {
    const object = await GraphCMSService.findObjectById(objectId);
    return object;
  }

  public static async getCmsContentTranslations(
    content,
    targetLanguage: string | null
  ) {
    // No need to translate content if the language is English
    // since content defaults to English. We can't translate empty
    // arrays, so short-circuit out of here if there's no content
    if (targetLanguage === "en" || !targetLanguage || !content.length) {
      return content;
    }

    try {
      const translatedContent = [];

      for (const cb of content) {
        const contentBlock = [];

        for (const block of cb["contentBlock"]) {
          const translatedBlock = { ...block };

          switch (block.type) {
            case "Image":
              translatedBlock["caption"]["html"] =
                await TranslateService.awsTranslate(
                  block["caption"]["html"],
                  targetLanguage
                );
              translatedBlock["altText"] = await TranslateService.awsTranslate(
                block["altText"],
                targetLanguage
              );
              break;

            case "ImageComparison":
              translatedBlock["leftImage"]["caption"]["html"] =
                await TranslateService.awsTranslate(
                  block["leftImage"]["caption"]["html"],
                  targetLanguage
                );
              translatedBlock["rightImage"]["altText"] =
                await TranslateService.awsTranslate(
                  block["rightImage"]["altText"],
                  targetLanguage
                );
              translatedBlock["rightImage"]["caption"]["html"] =
                await TranslateService.awsTranslate(
                  block["rightImage"]["caption"]["html"],
                  targetLanguage
                );
              translatedBlock["rightImage"]["altText"] =
                await TranslateService.awsTranslate(
                  block["rightImage"]["altText"],
                  targetLanguage
                );
              break;

            case "TextBlock":
              translatedBlock["textBlock"]["html"] =
                await TranslateService.awsTranslate(
                  block["textBlock"]["html"],
                  targetLanguage
                );
              break;

            case "Title":
              translatedBlock["title"] = await TranslateService.awsTranslate(
                block["title"],
                targetLanguage
              );
              translatedBlock["subtitle"] = await TranslateService.awsTranslate(
                block["subtitle"],
                targetLanguage
              );
              break;

            default:
              break;
          }

          contentBlock.push(translatedBlock);
        }

        translatedContent.push({ contentBlock });
      }

      return translatedContent;
    } catch (error) {
      console.error(
        `Failed to translate content block to language "${targetLanguage}`,
        error
      );
      return content;
    }
  }
}

export type ParsedRelatedStory =
  | {
      content: {
        story_title: string;
        original_story_title: string;
        stories: Array<ExtractedStoryInformation>;
      };
      unique_identifier: string;
      total: number;
      translated_title: string;
      link: string;
    }
  | {
      content: {};
      total: number;
      unique_identifier: string;
    };

export interface ExtractedStoryInformation {
  image_id: string;
  short_paragraph: { html: string };
  long_paragraph: { html: string };
  detail: null | Artwork;
}

export interface Artwork {
  id: number;
  room: string;
  invno: string;
  title: string;
  medium: string;
  people: string;
  culture: string;
  birthDate: string;
  deathDate: string;
  locations: string;
  creditLine: string;
  dimensions: string;
  displayDate: string;
  imageSecret: string;
  nationality: string;
  ensembleIndex: string;
  classification: string;
  shortDescription: string;
  visualDescription: string;
  curatorialApproval: string;
  art_url: string;
}
