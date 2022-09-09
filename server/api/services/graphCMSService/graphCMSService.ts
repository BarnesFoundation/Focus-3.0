import axios from "axios";

import Config from "../../../config";
import {
  storiesForObjectIdQuery,
  relatedStoriesByObjectIdQuery,
  relatedStoriesByTitleQuery,
  allStoriesQuery,
  getObjectByObjectIdQuery,
} from "./queries";
import { GraphQLQuery, RelatedStory } from "./types";
import { isEmpty } from "../../utils/isEmpty";
import ArtworkService, { ParsedRelatedStory } from "../artworkService";

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

  /** Retrieves a specific story from Graph CMS as identified by the provided object id */
  public static async findByObjectId(
    objectId: string,
    languagePreference: string
  ): Promise<ParsedRelatedStory> {
    const query = relatedStoriesByObjectIdQuery(objectId);
    const { data } = await GraphCMSService.makeGraphQLRequest(query);

    const relatedStories: Array<RelatedStory> = data.storiesForObjectIds[0]
      ? data.storiesForObjectIds[0].relatedStories
      : [];

    return await ArtworkService.parseRelatedStory(
      relatedStories,
      objectId,
      languagePreference
    );
  }

  /** Retrieves a specific story from Graph CMS as identified by the provided story title */
  public static async findByTitle(
    storyTitle: string,
    languagePreference: string
  ): Promise<ParsedRelatedStory> {
    const query = relatedStoriesByTitleQuery(storyTitle);
    const graphContent = await GraphCMSService.makeGraphQLRequest(query);

    const relatedStories = graphContent.data.storiesForObjectIds[0]
      .relatedStories as Array<RelatedStory>;

    return await ArtworkService.parseRelatedStory(
      relatedStories,
      null,
      languagePreference
    );
  }

  /** Retrieves the general story data for every published story in Graph CMS */
  public static async fetchAllStories(): Promise<
    Array<{
      id: string;
      storyTitle: string;
      stage: string;
    }>
  > {
    const query = allStoriesQuery();
    const response = await GraphCMSService.makeGraphQLRequest(query);

    return response.data.storieses;
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

  /** Retrieves special exhibit object information from Graph CMS as identified by the provided object id */
  public static async findObjectById(objectId: string): Promise<any> {
    const query = getObjectByObjectIdQuery(objectId);
    const {
      data: { specialExhibitionObjects },
    } = await GraphCMSService.makeGraphQLRequest(query);
    return specialExhibitionObjects;
  }
}
