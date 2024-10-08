import * as constants from "../constants";
import axios from "axios";

import {
  IdentifiedImagePayload,
  ImageSearchResponse,
} from "../classes/searchResponse";

class SearchRequestService {
  /** Retrieves the art information for the provided image id */
  getArtworkInformation = async (imageId, lang) => {
    // get lang from local storage
    try {
      let response = await axios.get(constants.ART_WORK_INFO_URL + imageId, {
        params: { lang },
      });
      return response.data;
    } catch (error) {
      console.log(
        "An error occurred while retrieving the artwork information from the server"
      );
    }
  };

  /** Stores the search attempt in the server */
  storeSearchedResult = async (searchResponse) => {
    const {
      searchSuccess,
      referenceImageUrl,
      esResponse,
      searchTime,
      data: formData,
    } = searchResponse;

    formData.append("searchSuccess", searchSuccess);
    formData.append("referenceImageUrl", referenceImageUrl);
    formData.append("esResponse", JSON.stringify(esResponse));
    formData.append("searchTime", searchTime);

    await axios.post(constants.STORE_SEARCHED_RESULT_URL, formData);
  };

  submitBookmarksEmail = async (email) => {
    const payload = { email };
    //payload.language = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) || 'en';
    await axios.post(constants.SUBMIT_BOOKMARKS_EMAIL_URL, payload);
  };

  saveLanguagePreference = async (language) => {
    const payload = { language };
    await axios.post(constants.SAVE_LANGUAGE_PREFERENCE_URL, payload);
  };

  getAppTranslations = async (lang) => {
    try {
      let response = await axios.get(constants.APP_TRANSLATIONS_URL, {
        params: { lang },
      });
      return response.data.data.translations;
    } catch (error) {
      console.log(
        "An error occurred while retrieving the translations from the server"
      );
    }
  };

  getStoryItems = async (imageId, lang) => {
    try {
      let response = await axios.get(constants.STORIES_URL(imageId), {
        params: { lang },
      });
      return response.data;
    } catch (error) {
      console.log("An error occurred while retrieving story from the server");
    }
  };

  getStoriesFromEmail = async (slug, lang) => {
    try {
      let response = await axios.get(
        constants.STORIES_EMAIL_PAGE_URL + slug + "?lang=" + lang
      );
      return response.data;
    } catch (error) {
      console.log("An error occurred while retrieving story from the server");
    }
  };

  markStoryAsRead = async (imageId: string, storyId: string) => {
    try {
      let response = await axios.post(
        constants.STORIES_READ_URL(imageId, storyId)
      );
      return response.data;
    } catch (error) {
      console.log(
        "An error occurred while marking story as read from the server"
      );
    }
  };

  /** Submits the image search request to the backend and returns and ImageSearchResponse object */
  public async submitImageSearchRequest(imageBlob: Blob) {
    try {
      const formData = new FormData();
      formData.set("image", imageBlob, "temp_image.jpg");

      const response = await axios.post(constants.SCAN_SEARCH_URL, formData);

      // Get the search time and number of results
      const searchTime = response.data.search_time;
      const resultsCount = response.data.results.length;

      // If a matching result was found, this image search was successful
      if (resultsCount > 0) {
        return new ImageSearchResponse(true, response, searchTime);
      }

      // Else, this image search was not successful
      else {
        return new ImageSearchResponse(false, response, searchTime);
      }
    } catch (error) {
      console.error(`An error occurred with the image search request`, error);
      return new ImageSearchResponse(false, null, null);
    }
  }

  /** Retrieves special exhibition object details from Hygraph/GraphCMS */
  getSpecialExhibitionObject = async (objectId, lang) => {
    try {
      const response = await axios.get(
        constants.EXHIBITION_OBJECT_URL(objectId),
        { params: { lang } }
      );
      return response.data;
    } catch (error) {
      console.log("An error occurred while retrieving story from the server");
    }
  };

  /** Closure function so that an identified item is processed only once. Returns an IdentifiedImagePayload object */
  processIdentifiedItem = async (identifiedItem, lang) => {
    // Get the image id and reference image url
    const imageId = identifiedItem.item.name;
    const referenceImageUrl = identifiedItem.image.thumb_120;
    let data;

    // If it is a special exhibition object, get info from CMS
    if (imageId.split("_")[0] === "SPEX") {
      data = await this.getSpecialExhibitionObject(imageId.split("_")[1], lang);
      // Otherwise search for item in ElasticSearch
    } else {
      // Retrieve artwork information
      data = await this.getArtworkInformation(imageId, lang);
    }

    return new IdentifiedImagePayload(data, referenceImageUrl);
  };

  validateEmail = async (email) => {
    try {
      let response = await axios.post(constants.VALIDATE_EMAIL_URL, {
        email: email,
      });
      return response.data;
    } catch (error) {
      console.log("An error occurred while validating email");
    }
  };

  public async getBookmarkEmail(sessionId: string) {
    try {
      const response = await axios.get(constants.BOOKMARK_EMAIL_URL(sessionId));
      return response.data;
    } catch (e) {
      console.log(
        "An error occurred while retrieving bookmark email from the server"
      );
    }
  }

  public async getStoryEmail(sessionId: string) {
    try {
      const response = await axios.get(constants.STORY_EMAIL_URL(sessionId));
      return response.data;
    } catch (e) {
      console.log(
        "An error occurred while retrieving story email from the server"
      );
    }
  }
}

export { SearchRequestService };
