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
    });

    // If there's a record for this id, we'll return it immediately
    if (record) {
      return record;
    }

    // Otherwise, no record found for the id, so we'll pull it
    // from ElasticSearch and persist it in our local records cache
    console.info(
      `No record found for "image_id": ${record.id}. Creating new record`
    );

    const now = new Date(Date.now()).toISOString();
    const recordFromElasticSearch = await ElasticSearchService.getObject(
      artworkId
    );

    const createdRecord = await prisma.es_cached_records.create({
      data: {
        es_data: recordFromElasticSearch,
        image_id: artworkId,

        created_at: now,
        updated_at: now,
      },
    });

    return createdRecord;
  }

  public static async findStoryForArtwork(
    artworkId: string
  ): Promise<{ storyId: null | number; hasStory: boolean }> {
    const graphqlQuery = {
      query: StoryForObjectIdQuery,
      variables: { objectID: artworkId },
    };

    const response = await axios({
      url: environmentConfiguration.graphCMS.endpoint,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: graphqlQuery,
    });

    // Check these two parts of the response for the story
    const retrievedStory = response.data.storiesForObjectIds[0]?.relatedStories;

    if (retrievedStory) {
      return {
        storyId: retrievedStory[0].id,
        hasStory: true,
      };
    }

    return {
      storyId: null,
      hasStory: false,
    };
  }
}

const StoryForObjectIdQuery = `query($objectID: Int) {
	storiesForObjectIds(where: { objectID: $objectID }) {
	  id
	  objectID
	  relatedStories {
		id
	  }
	}
  }`;
