import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { environmentConfiguration } from "../../config/";

import ElasticSearchService from "./elasticSearchService";

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

  public static async findStoryForArtwork(
    artworkId: string
  ): Promise<{ storyId: null | number; hasStory: boolean }> {}
}
