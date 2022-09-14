import { History, Match } from "react-router-dom";
import { ArtworkObject, ArtWorkRecordsResult } from "./payloadTypes";

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
  match: Match;
  history: History;
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
  result: ArtWorkRecordsResult;
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

export type CameraContainerProps = {
  history: History;
};

export type CameraContainerState = {
  scanSeqId: any;
  shouldBeScanning: boolean;
  sessionYieldedMatch: boolean;
};

export type LanguageDropdownProps = {
  onSelectLanguage: (item: LanguageOptionType) => void;
  isStoryItemDropDown?: boolean;
  selected: LanguageOptionType;
  langOptions: WithTranslationState["langOptions"];
};

export type NoMatchOverlayProps = {
  displayOverlay: boolean;
  handleScan: () => void;
} & WithTranslationState;

export type ResultCardProps = {
  artwork: ArtworkObject["artwork"];
  refCallbackInfo: (element: any) => void;
  setArtworkRef: (element: any) => void;
  langOptions: WithTranslationState["langOptions"];
  selectedLanguage: LanguageOptionType;
  onSelectLanguage: (item: LanguageOptionType) => void;
  shortDescContainer: any;
  specialExhibition: boolean;
  getTranslation: WithTranslationState["getTranslation"];
};

export type ShareProps = {
  artwork: ArtworkObject["artwork"];
  shareText: string;
};

export type StoryTitleProps = {
  langOptions: WithTranslationState["langOptions"];
  selectedLanguage: LanguageOptionType;
  onSelectLanguage: (item: LanguageOptionType) => void;
};

export type UnsupportedDialogueProps = {
  unsupportedIOSBrowser?: boolean;
  unsupportedIOSVersion?: boolean;
} & WithTranslationState;

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

export type WithTranslationState = {
  translations;
  loaded: boolean;
  getTranslation: (screen: string, textId: string) => string;
  updateTranslations: () => Promise<void>;
  langOptions: LanguageOptionType[];
  getSelectedLanguage: () => Promise<LanguageOptionType[]>;
  updateSelectedLanguage: (language: LanguageOptionType) => Promise<void>;
};
