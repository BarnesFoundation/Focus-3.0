import axios from "axios";

import Config from "../../../config";
import {
  storiesForObjectIdQuery,
  relatedStoriesByObjectIdQuery,
} from "./queries";
import { GraphQLQuery, RelatedStory } from "./types";
import { isEmpty } from "../../utils/isEmpty";

const UNIQUE_SEPARATOR = "***";

/** Class responsible for interacting with an GraphCMS project */
export default class GraphCMSService {
  private static async makeGraphQLRequest(query: GraphQLQuery) {
    try {
      const response = await axios({
        url: Config.graphCMS.endpoint,
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        data: query,
      });
      return response.data;
    } catch (error) {
      console.log(
        `An error occurred making the request to the GraphCMS endpoint`,
        error
      );
    }
  }

  /** Retrieves records from ElasticSearch with the provided offset and limit */
  public static async hasStory(objectId: string) {
    const query = storiesForObjectIdQuery(objectId);
    const response = await GraphCMSService.makeGraphQLRequest(query);

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

  /** Retrieves a specific record from ElasticSearch as identified by the provided object id */
  public static async findByObjectId(
    objectId: string
  ): Promise<Array<RelatedStory>> {
    const query = relatedStoriesByObjectIdQuery(objectId);
    const graphContent = await GraphCMSService.makeGraphQLRequest(query);

    // Empty content means nothing available to translate and parse
    if (
      isEmpty(graphContent.data.storiesForObjectIds) ||
      isEmpty(graphContent.data.storiesForObjectIds[0].relatedStories)
    ) {
      return [];
    }

    const relatedStories =
      graphContent.data.storiesForObjectIds[0].relatedStories;

    return relatedStories;
  }

  private static getTranslatatableContent(
    storyFields,
    objectId: string,
    language: string
  ) {
    const translatableContent = {};

    new Array(6).forEach((_, index) => {
      const increment = index + 1;
      const objectIdIdentifier = `objectID${increment}`;

      if (!storyFields[objectIdIdentifier]) {
        return;
      }

      const imageId =
        "objectID1" === objectIdIdentifier &&
        objectId === storyFields[objectIdIdentifier]
          ? storyFields["alternativeHeroImageObjectID"]
          : storyFields[objectIdIdentifier];
      if (language !== "en") {
        translatableContent[imageId] = `${UNIQUE_SEPARATOR} ${
          storyFields[`shortParagraph${objectIdIdentifier}`]["html"]
        }`;
        // translatableContent[imageId] = `${UNIQUE_SEPARATOR} ${storyFields[`longParagraph${objectIdIdentifier}`]['html']}`
      }
    });

    if (!isEmpty(translatableContent)) {
      const translatableText = Object.values(translatableContent).join(" ");

      /* let translatedText = 
		translatable_text = SnapTranslator.translate_story_content(translatable_text, preferred_lang)["html"]
		translatable_text = translatable_text.split("#{UNIQUE_SEPARATOR}").drop(1).map(&:lstrip)
		keys = translatable_content.keys
		translatable_content = Hash[keys.zip(translatable_text)] */
    }

    return translatableContent;
  }
}
