import { PrismaClient } from "@prisma/client";

import ElasticSearchService from "./elasticSearchService";
import GraphCMSService from "./graphCMSService";

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
    let content = {};
    let total = 0;
    let uniqueIdentifier = null;

    const relatedStories = await GraphCMSService.findByObjectId(artworkId);

    if (relatedStories.length === 0) {
      return {
        content,
        total,
        unique_identifier: uniqueIdentifier,
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
        select: { es_data: true },
        where: {
          image_id: { in: storyArtworkIds },
        },
      })
    ).map((record) => record.es_data);

    content = {
      story_title: storyFields.storyTitle,
      original_story_title: storyFields.storyTitle,
      stories: ArtworkService.getStoriesDetail(stories, artworks, {}),
    };

    uniqueIdentifier = storyFields.id;
    total = stories.length;

    return {
      content,
      unique_identifier: uniqueIdentifier,
      total,
    };
  }

  private static extractStoryInformation(storyFields, objectId: string) {
    const stories = [];

    [...Array(6)].forEach((_, i) => {
      const index = i + 1;
      const identifier = `objectID${index}`;

      if (!storyFields[identifier]) {
        return;
      }

      const imageId =
        "objectID1" === identifier && objectId === storyFields[identifier]
          ? storyFields["alternativeHeroImageObjectID"]
          : storyFields[identifier];

      stories.push({
        image_id: imageId,
        short_paragraph: storyFields[`shortParagraph${index}`],
        long_paragraph: storyFields[`longParagraph${index}`],
        detail: null,
      });
    });

    return stories;
  }

  private static getStoriesDetail(stories, artworks, translatableContent) {
    const storiesWithDetail = stories.map((story) => {
      const detail = artworks.find((art) => {
        return art.id == story.image_id;
      });

      if (detail) {
        story["detail"] = detail;
      }

      return story;
    });

    return storiesWithDetail;
  }
}
