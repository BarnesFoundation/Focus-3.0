export type ArtWorkRecord = {
  id: number;
  room: string;
  invno: string;
  title: string;
  medium: string;
  people: string;
  culture: string;
  birthDate: string;
  deathDate: string;
  locations: string;
  creditLine: string;
  dimensions: string;
  displayDate: string;
  imageSecret: string;
  nationality: string;
  ensembleIndex: string;
  classification: string;
  shortDescription?: string;
  visualDescription: string;
  curatorialApproval: string;
  art_url: string;
  content?: Content;
};

type Content = {
  contentBlock: ContentBlock[];
};

export type ContentBlock =
  | Image
  | ImageCarousel
  | ImageComparison
  | TextBlock
  | Title
  | Video;

export enum ContentBlockTypes {
  IMAGE = "Image",
  IMAGE_CAROUSEL = "ImageCarousel",
  IMAGE_COMPARISON = "ImageComparison",
  TEXT_BLOCK = "TextBlock",
  TITLE = "Title",
  VIDEO = "Video",
}

export enum ImageComparisonStyle {
  SLIDER = "Slider",
  ANIMATION_FADE = "Animation_Fade",
}

type Image = {
  type: ContentBlockTypes.IMAGE;
  caption?: {
    html: string;
  };
  altText?: string;
  image: {
    url: string;
  };
};

type ImageCarousel = {
  type: ContentBlockTypes.IMAGE_CAROUSEL;
  imageCarousel: {
    image: {
      url: string;
    };
    caption?: {
      html: string;
    };
  }[];
};

type ImageComparison = {
  type: ContentBlockTypes.IMAGE_COMPARISON;
  style: ImageComparisonStyle;
  rightImage: Image;
  leftImage: Image;
};

type TextBlock = {
  type: ContentBlockTypes.TEXT_BLOCK;
  textBlock: {
    html: string;
  };
};

type Title = {
  type: ContentBlockTypes.TITLE;
  titleHtml?: {
    html: string;
  };
  subtitleHtml?: {
    html: string;
  };
};

type Video = {
  type: ContentBlockTypes.VIDEO;
  url: string;
};

export type ArtWorkRecordsResult = {
  data: {
    records: ArtWorkRecord[];
    roomRecords;
    message: string;
    showStory: boolean;
    specialExhibition: boolean;
  };
  success: boolean;
  requestComplete: boolean;
};

export type ArtworkObject = {
  id?: number;
  title?: string;
  shortDescription?: string;
  artist?: string;
  nationality?: string;
  birthDate?: string;
  deathDate?: string;
  culture?: string;
  classification?: string;
  locations?: string;
  medium?: string;
  invno?: string;
  displayDate?: string;
  dimensions?: string;
  visualDescription?: string;
  url?: string;
  url_low_quality?: string;
  bg_url?: string;
  curatorialApproval?: boolean;
  unIdentified?: boolean;
  content?: Content[];
  creditLine?: {
    html: string;
  };
};

export type StoryItemType = {
  image_id: string;
  short_paragraph: {
    html: string;
  };
  long_paragraph: {
    html: string;
  };
  detail: ArtWorkRecord;
};

export type StoryItemsResponse = {
  data: {
    content: {
      story_title: string;
      original_story_title: string;
      stories: StoryItemType[];
    };
    unique_identifier: string;
    total: number;
    translated_title: string;
    link: string;
  };
};

export type StoryResponse = {
  stories: StoryItemType[];
  storyId: string;
  storyTitle: string;
};
