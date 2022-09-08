import { TimelineLite } from "gsap/all";

export type StoryItemProps = {
  sceneStatus: {
    type: string;
    state: string;
  };
  statusCallback: (showTitle: boolean) => void;
  storyIndex: number;
  onStoryReadComplete: () => void;
  getSize: (scrollOffset: number, storyIndex: number) => void;
  storyEmailPage?: boolean;
  isLastStoryItem: boolean;
  progress: number;
  story: {
    detail: {
      art_url: string;
      people: string;
      title: string;
      culture: string;
      nationality: string;
      birthDate: string;
      deathDate: string;
      displayDate: string;
    };
    long_paragraph: {
      html: string;
    };
    short_paragraph: {
      html: string;
    };
  };
  storyTitle: string;
  onVisChange: (isVisible: boolean, storyIndex: number) => void;
  selectedLanguage: {
    code: string;
  };
};

export type StoryItemState = {
  storyRead: boolean;
  heightUpdated: boolean;
  scrollHeight: number;
  showTitle: boolean;
  scrollOffset?: number;
};

export type ArtworkComponentProps = {
  match: any;
  history: any;
} & WithTranslationState;

export type ArtworkComponentState = {
  showEmailScreen: boolean;
  emailCaptured: boolean;
  showEmailForm: boolean;
  emailCaptureAck: boolean;
  imgLoaded: boolean;
  alsoInRoomResults: any[];
  email: string;
  snapAttempts: number;
  errors: { email: boolean };
  showTitleBar: boolean;
  storyDuration: number;
  infoHeightUpdated: boolean;
  infoCardDuration: number;
  emailCardClickable: boolean;
  storyTopsClickable: {};
  result: ArtWorkResult;
  selectedLanguage: LanguageOptionType;
  stories: any[];
  storyId: string;
  storyTitle: string;
  showStory: boolean;
  artwork: ArtworkObject["artwork"];
  roomRecords: ArtworkObject["roomRecords"];
  storyDurationsCurrent: any[];
  storyOffsets: any[];
};

type English = { name: "English"; code: "En"; selected: boolean };
type Spanish = { name: "Español"; code: "Es"; selected: boolean };
type French = { name: "Français"; code: "Fr"; selected: boolean };
type German = { name: "Deutsch"; code: "De"; selected: boolean };
type Italian = { name: "Italiano"; code: "It"; selected: boolean };
type Russian = { name: "русский"; code: "Ru"; selected: boolean };
type Chinese = { name: "中文"; code: "Zh"; selected: boolean };
type Japanese = { name: "日本語"; code: "Ja"; selected: boolean };
type Korean = { name: "한국어"; code: "Ko"; selected: boolean };

export type LanguageOptionType =
  | English
  | Spanish
  | French
  | German
  | Italian
  | Russian
  | Chinese
  | Japanese
  | Korean;

export type ArtWorkResult = {
  data: {
    records: {
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
      shortDescription: string;
      visualDescription: string;
      curatorialApproval: string;
      art_url: string;
    }[];
    roomRecords;
    message: string;
    show_story: boolean;
    specialExhibition: boolean;
  };
  success: boolean;
  requestComplete: boolean;
};

export type ArtworkObject = {
  artwork: {
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
  };
  roomRecords: any[];
};

export type WithTranslationState = {
  translations;
  loaded: boolean;
  getTranslation: (screen: string, textId: string) => string;
  updateTranslations: () => Promise<void>;
  langOptions: LanguageOptionType[];
  getSelectedLanguage: () => Promise<LanguageOptionType[]>;
  updateSelectedLanguage: (language: string) => void;
};
