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
  storyEmailPage: boolean;
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
