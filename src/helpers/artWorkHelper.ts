import {
  ArtworkObject,
  ArtWorkRecordsResult,
  StoryItemsResponse,
  StoryItemType,
} from "../types/payloadTypes";

export const constructResultAndInRoomSlider = (
  artworkResult: ArtWorkRecordsResult,
  isTablet: boolean
): ArtworkObject => {
  const { success } = artworkResult;

  let artwork = {};
  let roomRecords = [];

  if (success) {
    // If the artwork result has records
    if (artworkResult["data"]["records"].length > 0) {
      const w = screen.width;
      const h = isTablet ? screen.height : 95;
      const artUrlParams = `?w=${w - 120}`;
      const cropParams = `?q=0&auto=compress&crop=faces,entropy&fit=crop&w=${w}`;
      const topCropParams = `?q=0&auto=compress&crop=top&fit=crop&h=${h}&w=${w}`;
      const lowQualityParams = `?q=0&auto=compress&w=${w - 120}`;

      // Extract needed data from the art object
      const artObject = artworkResult["data"]["records"][0];
      const {
        id,
        title,
        shortDescription,
        people: artist,
        nationality,
        birthDate,
        deathDate,
        culture,
        classification,
        locations,
        medium,
        invno,
        displayDate,
        dimensions,
        visualDescription,
      } = artObject;

      // Determine the flags
      const curatorialApproval =
        artObject.curatorialApproval === "false" ? false : true;
      const unIdentified = artObject.people
        .toLowerCase()
        .includes("unidentified");

      // Assign into artwork
      artwork = {
        id,
        title,
        shortDescription,
        artist,
        nationality,
        birthDate,
        deathDate,
        culture,
        classification,
        locations,
        medium,
        invno,
        displayDate,
        dimensions,
        visualDescription,

        // Set the urls
        url: `${artObject.art_url}${artUrlParams}`,
        url_low_quality: `${artObject.art_url}${lowQualityParams}`,
        bg_url: `${artObject.art_url}${topCropParams}`,

        // Set the flags
        curatorialApproval,
        unIdentified,
      };
    }
    // Get the room records array
    const rr = artworkResult["data"]["roomRecords"] || [];

    if (rr?.length > 0) {
      roomRecords = rr;
    }
  }
  return { artwork, roomRecords };
};

export const constructStory = (storyInformation: StoryItemsResponse) => {
  let stories: StoryItemType[] = [],
    storyId: string = undefined,
    storyTitle: string = undefined;

  if (storyInformation.data.total > 0) {
    ({ stories, story_title: storyTitle } = storyInformation.data.content);
    storyId = storyInformation.data.unique_identifier;
  }

  return { stories, storyId, storyTitle };
};
