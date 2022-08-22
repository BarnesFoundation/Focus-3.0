export type GraphQLQuery = {
  query: string;
  variables: { [key: string]: string | number | number[] };
};

export type StoryParagraph = {
  html: string;
} | null;
type StoryObjectId = string | null;

export interface RelatedStory {
  id: string;
  storyTitle: string;
  alternativeHeroImageObjectID: string;
  objectID1: StoryObjectId;
  shortParagraph1: StoryParagraph;
  longParagraph1: StoryParagraph;
  objectID2: StoryObjectId;
  shortParagraph2: StoryParagraph;
  longParagraph2: StoryParagraph;
  objectID3: StoryObjectId;
  shortParagraph3: StoryParagraph;
  longParagraph3: StoryParagraph;
  objectID4: StoryObjectId;
  shortParagraph4: StoryParagraph;
  longParagraph4: StoryParagraph;
  objectID5: StoryObjectId;
  shortParagraph5: StoryParagraph;
  longParagraph5: StoryParagraph;
  objectID6: StoryObjectId;
  shortParagraph6: StoryParagraph;
  longParagraph6: StoryParagraph;
}
