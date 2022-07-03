import axios from "axios";
import { PrismaClient } from "@prisma/client";

import Config from "../../../config";
import {
  GraphQLQuery,
  storiesForObjectIdQuery,
  relatedStoriesByObjectIdQuery,
} from "./queries";

const prisma = new PrismaClient();

const isEmpty = (theObject: {}) => Object.keys(theObject).length === 0;
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
    objectId: string,
    preferredLanguage: string = "en"
  ) {
    const query = relatedStoriesByObjectIdQuery(objectId);
    const response = await this.makeGraphQLRequest(query);
  }

  private static parseAndFetchMetaData(
    graphContent,
    objectId: string,
    language: string
  ) {
    let content = {};
    let total = 0;
    let uniqueIdentifier = null;

    // Empty content means nothing available to translate and parse
    if (
      isEmpty(graphContent.data.storiesForObjectIds) ||
      isEmpty(graphContent.data.storiesForObjectIds[0].relatedStories)
    ) {
      return {
        unique_identifier: uniqueIdentifier,
        total,
        content,
      };
    }

    const relatedStories =
      graphContent.data.storiesForObjectIds[0].relatedStories;
    const storyFields =
      relatedStories.length > 1
        ? relatedStories[relatedStories.length - 1]
        : relatedStories[0];

    const stories = this.extractStories(storyFields, objectId);
    const storyArtworkIds = stories.map((story) => story.image_id);
    const artworks = prisma.es_cached_records.findMany({
      select: { es_data: true },
      where: {
        image_id: { in: storyArtworkIds },
      },
    });

    const storiesWithDetails = (content = {
      story_title: storyFields["storyTitle"],
      original_story_title: storyFields["storyTitle"],
    });

    /* 	  content["story_title"] = preferred_lang == "en" ? story_attrs["storyTitle"] : SnapTranslator.translate_story_title(story_attrs["storyTitle"], preferred_lang)
	  content["original_story_title"] = story_attrs["storyTitle"]
	  stories = get_stories(story_attrs, searched_object_id, translatable_content)
	  arts = EsCachedRecord.fetch_all(stories.map{|s| s["image_id"]})
	  content["stories"] = get_stories_details(stories, arts, translatable_content)
  
	  unique_identifier = story_attrs["id"]
	  total = content["stories"].count
  
	  return {unique_identifier: unique_identifier, content: content, total: total} */
  }

  private static extractStories(storyFields, objectId: string) {
    const stories = [];

    new Array(6).forEach((_, index) => {
      const identifier = `objectID${index}`;

      if (!storyFields[identifier]) {
        return;
      }

      const imageId =
        "objectID1" === identifier && objectId === storyFields[identifier]
          ? storyFields["alternativeHeroImageObjectID"]
          : storyFields[identifier];
      storyFields.push({
        image_id: imageId,
        short_paragraph: storyFields["shortParagraph"],
        long_paragraph: storyFields["longParagraph"],
        detail: null,
      });
    });

    return stories;
  }

  private static getStoriesDetail(stories, artworks, translatableContent) {
    const storiesWithDetail = stories.map((story) => {
      const detail = artworks.find((art) => art.id === story.image_id);

      if (detail) {
        story["detail"] = detail;
      }
    });
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
