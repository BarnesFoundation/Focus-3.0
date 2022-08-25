import { PrismaClient } from "@prisma/client";

import ElasticSearchService from "./elasticSearchService";
import GraphCMSService, { RelatedStory, ObjectID } from "./graphCMSService";

import { generateImgixUrl } from "../utils/generateImgixUrl";

const prisma = new PrismaClient();

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

  public static async findStoryForArtwork(artworkId: string): Promise<any> {
    const relatedStories = await GraphCMSService.findByObjectId(artworkId);
    return relatedStories;
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

  private static getStoriesDetail(
    stories: Array<ExtractedStoryInformation>,
    artworks: any,
    translatableContent: {}
  ) {
    const storiesWithDetail = stories.map((story) => {
      const detailForStory = artworks.find((art: any) => {
        art.id == story.image_id;
      });

      if (detailForStory) {
        story["detail"] = detailForStory;
      }

      return story;
    });

    return storiesWithDetail;
  }

  public static async parseRelatedStory(
    relatedStories: Array<RelatedStory>,
    artworkId: string | null
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
    ).map(({ es_data, image_id }) => {
      es_data["art_url"] = generateImgixUrl(image_id, es_data["imageSecret"]);
      return es_data;
    });

    return {
      content: {
        story_title: storyFields.storyTitle,
        original_story_title: storyFields.storyTitle,
        stories: ArtworkService.getStoriesDetail(stories, artworks, {}),
      },
      unique_identifier: storyFields.id,
      total: stories.length,
    };
  }
}

export interface ParsedRelatedStory {
  content:
    | {
        story_title: string;
        original_story_title: string;
        stories: Array<ExtractedStoryInformation>;
      }
    | {};
  unique_identifier: string;
  total: number;
}

export interface ExtractedStoryInformation {
  image_id: string;
  short_paragraph: string;
  long_paragraph: string;
  detail: null;
}
