import sanitizeHtml from "sanitize-html";
import parse from "html-react-parser";
import {
  ArtworkObject,
  ArtWorkRecordsResult,
  StoryItemsResponse,
  StoryItemType,
  StoryResponse,
} from "../types/payloadTypes";

export const constructResultAndInRoomSlider = (
  artworkResult: ArtWorkRecordsResult,
  isTablet: boolean
): ArtworkObject => {
  const { success } = artworkResult;

  let artwork = {};

  if (success) {
    // If the artwork result has records
    if (artworkResult["data"]["records"].length > 0) {
      const w = screen.width;
      const h = isTablet ? screen.height : 95;
      const artUrlParams = `?w=${w - 120}`;
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
        content,
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
        content,

        // Set the urls
        url: `${artObject.art_url}${artUrlParams}`,
        url_low_quality: `${artObject.art_url}${lowQualityParams}`,
        bg_url: `${artObject.art_url}${topCropParams}`,

        // Set the flags
        curatorialApproval,
        unIdentified,
      };
    }
  }
  return artwork;
};

export const constructStory = (
  storyInformation: StoryItemsResponse
): StoryResponse => {
  let stories: StoryItemType[] = [],
    storyId: string = undefined,
    storyTitle: string = undefined;

  if (storyInformation.data.total > 0) {
    ({ stories, story_title: storyTitle } = storyInformation.data.content);
    storyId = storyInformation.data.unique_identifier;
  }

  return { stories, storyId, storyTitle };
};

export const formatHtml = (html) => {
  return parse(
    sanitizeHtml(html, {
      allowedTags: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "li",
        "ol",
        "p",
        "ul",
        "a",
        "br",
        "code",
        "em",
        "span",
        "strong",
        "u",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr",
      ],
      allowedAttributes: {
        a: ["href", "target"],
      },
    })
  );
};

export const formatHtmlCaption = (html) => {
  return parse(
    sanitizeHtml(html, {
      allowedTags: ["p", "a", "br", "em", "span", "strong", "u"],
      allowedAttributes: {
        a: ["href", "target"],
      },
    })
  );
};
