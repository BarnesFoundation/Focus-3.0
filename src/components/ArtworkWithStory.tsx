import React, { Component, CSSProperties } from "react";
import { withRouter } from "react-router";
import { compose } from "redux";
import $ from "jquery";
import ScrollMagic from "scrollmagic";
import { Controller, Scene } from "react-scrollmagic";
// @ts-ignore
import { isAndroid, isIOS } from "react-device-detect";
// @ts-ignore
import styled, { css } from "styled-components";

import * as constants from "../constants";
import withOrientation from "./withOrientation";
import withTranslation, {
  LanguageOptionType,
  WithTranslationState,
} from "./withTranslation";
import { EmailForm } from "./EmailForm";
import StoryItem from "./StoryItem";
import { ScanButton } from "./ScanButton";
import { ResultCard } from "./ResultCard";
import { StoryTitle } from "./StoryTitle";
import { constructStory } from "../helpers/artWorkHelper";
import {
  ArtworkObject,
  ArtWorkRecordsResult,
  StoryItemType,
} from "../types/payloadTypes";
import { SearchRequestService } from "../services/SearchRequestService";

/**
 * withRouter HOC provides props with location, history and match objects
 */
const SectionWipesStyled = styled.div`
  ${(props) =>
    props.hasChildCards &&
    css`
      overflow: hidden;
    `}
  .panel {
    height: auto;
    min-height: 800px;
    width: 100vw;
  }
  .panel.panel-fixed {
    position: fixed;
  }
`;

type ArtworkWithStoryProps = {
  artwork: ArtworkObject;
  result: ArtWorkRecordsResult;
  imageId: string;
  onSelectLanguage: (selectedLanguage: LanguageOptionType) => void;
  selectedLanguage: LanguageOptionType;
  emailCaptured: boolean;
  showEmailForm: boolean;
  emailCaptureAck: boolean;
  onSubmitEmail: (email: string, callback?: (args?: any) => void) => void;
} & WithTranslationState;

type ArtworkWithStoryState = {
  imgLoaded: boolean;
  showTitleBar: boolean;
  emailCardClickable: boolean;
  storyTopsClickable: {};
  stories?: StoryItemType[];
  storyId?: string;
  storyTitle?: string;
  showStory?: boolean;
  storyDurationsCurrent?: number[];
  storyOffsets?: number[];
  loaded: boolean;
};

export class ArtworkWithStory extends Component<
  ArtworkWithStoryProps,
  ArtworkWithStoryState
> {
  sr: SearchRequestService;
  artworkScene: ScrollMagic.Scene;
  emailScene: ScrollMagic.Scene;
  emailSceneTrigger: ScrollMagic.Scene;
  artworkRef: HTMLDivElement;
  infoCardRef: HTMLDivElement;
  sceneRefs: Scene[];
  artworkScrollOffset: number;
  langOptions: LanguageOptionType[];
  artworkTimeoutCallback;
  controller: ScrollMagic.Controller;
  emailFormHeight: number;

  constructor(props) {
    super(props);

    // Initialize the search request services
    this.sr = new SearchRequestService();

    // Scenes that end up being created by ScrollMagic
    this.artworkScene = null;
    this.emailScene = null;
    this.emailSceneTrigger = null;

    // Refs that end up being assigned to
    this.artworkRef = null;
    this.infoCardRef = null;
    this.sceneRefs = [];

    this.artworkScrollOffset = 0;
    this.artworkTimeoutCallback = null;

    this.state = {
      imgLoaded: false,
      showTitleBar: false,
      emailCardClickable: true,
      storyTopsClickable: {},
      loaded: false,
    };
  }

  async componentWillMount() {
    const durationCurArr: number[] = [];
    const durationNextArr: number[] = [];
    const storyPositionArr: boolean[] = [];
    const offsetArr: number[] = [];
    const durDefault = 300;

    const { stories, storyId, storyTitle } = await this.setupStory(
      this.props.imageId
    );

    stories.forEach((story) => {
      durationCurArr.push(durDefault);
      offsetArr.push(durDefault);
      storyPositionArr.push(false);
    });
    durationNextArr.push(durDefault);

    this.setState({
      stories: stories,
      storyId: storyId,
      storyTitle: storyTitle,
      showStory: this.props.result.data.showStory,
      storyDurationsCurrent: durationCurArr,
      storyOffsets: offsetArr,
      loaded: true,
    });
  }

  componentDidUpdate(
    prevProps: ArtworkWithStoryProps,
    _prevState: ArtworkWithStoryState
  ) {
    if (!this.artworkRef) {
      return;
    }
    if (prevProps.selectedLanguage.code !== this.props.selectedLanguage.code) {
      const newOffset = Math.max(
        Math.ceil(
          this.artworkRef.getBoundingClientRect().bottom -
            constants.VIEWPORT_HEIGHT
        ),
        0
      );
      this.artworkScrollOffset = newOffset + 100;
      console.log(
        "Setting new offset to Artwork scene on componentDidUpdate: ",
        Math.ceil(this.artworkRef.getBoundingClientRect().height),
        this.artworkScrollOffset
      );
      this.resetArtworkSceneSettings();

      if (!this.state.showStory) {
        this.resetEmailSceneTriggerSettings();
      }
    }
  }

  componentWillUnmount() {
    if (this.artworkTimeoutCallback) clearTimeout(this.artworkTimeoutCallback);
    this.artworkScene && this.artworkScene.remove();
    this.emailScene && this.emailScene.remove();
    this.emailSceneTrigger && this.emailSceneTrigger.remove();
    this.artworkScene && this.artworkScene.destroy(true);
    this.emailScene && this.emailScene.destroy(true);
    this.emailSceneTrigger && this.emailSceneTrigger.destroy(true);

    this.controller.destroy(true);
    this.emailScene = null;
    this.artworkScene = null;
    this.controller = null;
  }

  resetArtworkSceneSettings = () => {
    this.artworkScene.removePin(true);
    this.artworkScene.offset(this.artworkScrollOffset);
    this.artworkScene.setPin("#search-result");
    this.artworkScene.refresh();
  };

  resetEmailSceneTriggerSettings = () => {
    if (this.emailSceneTrigger) {
      this.emailSceneTrigger.removePin();
      this.emailSceneTrigger.duration(this.artworkScrollOffset - 100);
      this.emailSceneTrigger.setPin("#email-trigger-enter");
      this.emailSceneTrigger.refresh();
    }
  };

  onSelectLanguage = async (selectedLanguage: LanguageOptionType) => {
    this.props.onSelectLanguage(selectedLanguage);
    const { stories, storyId, storyTitle } = await this.setupStory(
      this.props.imageId
    );

    this.setState({
      stories,
      storyId,
      storyTitle,
    });
  };

  setupStory = async (imageId: string) => {
    const storyInformation = await this.sr.getStoryItems(imageId);
    return constructStory(storyInformation);
  };

  /** Sets up the ScrollMagic scene for the artwork result section */
  setupArtworkScene = () => {
    // Calculate the vertical offset for the artwork result
    const artworkVerticalOffset = Math.max(
      Math.ceil(
        this.artworkRef.getBoundingClientRect().bottom -
          constants.VIEWPORT_HEIGHT
      ),
      0
    );
    this.artworkScrollOffset = artworkVerticalOffset + 150;

    this.artworkScene = new ScrollMagic.Scene({
      triggerElement: "#search-result",
      triggerHook: "onLeave",
      duration: 0, // scroll distance
      offset: this.artworkScrollOffset,
    })
      .setPin("#search-result", { pushFollowers: false }) // pins the element for the the scene's duration
      .addTo(this.controller);
  };

  /** Handles the tap-to-scroll functionality for cards */
  handleClickScroll = (storyIndex: number, isStoryCard: boolean) => {
    let landingPoint;

    // Determine the offset needed for the height of each story card and the amount it should peek up
    let heightOffset = screen.height < 800 ? 800 : screen.height;
    let peekOffset = screen.height < 800 ? 158 : screen.height / 3;

    // If the click originated from a story card
    if (isStoryCard) {
      // Amount needed for getting past the first card
      const duration: number =
        typeof this.sceneRefs[0].props.duration === "string"
          ? parseInt(this.sceneRefs[0].props.duration)
          : this.sceneRefs[0].props.duration;

      let initial = Math.abs(duration) + peekOffset;

      if (storyIndex == 0) {
        landingPoint = initial;
      }

      // Each subsequent card uses the initial offset plus its own height offset calculation
      else {
        landingPoint = initial + heightOffset * storyIndex + storyIndex * 25;
      }
    }

    // For email clicks
    else {
      landingPoint = this.emailScene.scrollOffset() + heightOffset;
    }

    // For iOS, override the normal scrolling
    if (isIOS) {
      this.controller.scrollTo((nextStoryPoint) => {
        $("html, body").animate({ scrollTop: nextStoryPoint });
      });
    }

    this.controller.scrollTo(landingPoint);
  };

  /** Sets up the ScrollMagic scene for the email on-enter scene */
  setupEmailSceneOnEnter = () => {
    this.emailSceneTrigger = new ScrollMagic.Scene({
      triggerElement: "#email-trigger-enter",
      triggerHook: "onEnter",
      duration: this.artworkScrollOffset - 150,
    })
      .on("leave", (event) => {
        this.emailSceneTrigger.removePin();
        this.emailSceneTrigger.refresh();
      })
      .addTo(this.controller);
  };

  /** Sets up the ScrollMagic for the email panel */
  setupEmailScene = () => {
    this.emailScene = new ScrollMagic.Scene({
      triggerElement: "#email-panel",
      triggerHook: "onEnter",
      duration: 0, // scroll distance
      offset: this.emailFormHeight, // start this scene after scrolling for emailFormHeight px.
    })
      .on("leave", (event) => {
        this.setState({ emailCardClickable: true });
      })
      .on("enter", (event) => {
        this.setState({ emailCardClickable: false });
      })
      .addTo(this.controller);
  };

  setArtworkRef = (elem: HTMLDivElement) => {
    if (elem) {
      this.artworkRef = elem;
      const scrollContainer = isAndroid ? { container: ".sm-container" } : {};
      this.controller = new ScrollMagic.Controller(scrollContainer);
      this.artworkTimeoutCallback = setTimeout(() => {
        this.setupArtworkScene();
        if (!this.state.showStory && !this.props.emailCaptured) {
          this.setupEmailSceneOnEnter();
        }
        if (!this.props.emailCaptured) {
          this.setupEmailScene();
        }
      }, 0);
    }
  };

  onStoryReadComplete = () => {
    const { storyId } = this.state;
    this.sr.markStoryAsRead(this.props.imageId, storyId);
  };

  onStoryHeightReady = (height: number, index: number) => {
    if (index > -1) {
      //console.log('Story durations based on height :: ', index, height);
      var durationCurArr = this.state.storyDurationsCurrent;
      durationCurArr[index] = index == 0 ? 0 : height;
      this.setState({ storyDurationsCurrent: durationCurArr });
    }
  };

  onEmailHeightReady = (height: number) => {
    this.emailFormHeight = (height * 2) / 2.2;
  };

  storySceneCallback = (showTitle: boolean) => {
    if (showTitle) {
      this.setState({ showTitleBar: true });
    } else {
      this.setState({ showTitleBar: false });
    }
  };

  refCallbackInfo = (element: HTMLDivElement) => {
    if (element) {
      this.infoCardRef = element;
    }
  };

  onArtworkImgLoad = ({ target: _img }) => {
    this.setState({ imgLoaded: true });
  };

  /** Renders each of the story cards */
  renderStory = () => {
    const { stories, storyTitle } = this.state;
    const { showEmailForm } = this.props;

    // Iterate through the available stories
    return stories.map((story, index) => {
      const storyIndex = index + 1;
      const storyDuration = this.state.storyDurationsCurrent[index] * 5;
      const storySceneOffset =
        index > 0
          ? this.state.storyOffsets[index] - 342
          : constants.INFO_CARD_DURATION + 33;

      // Amount that the story should peek
      const peekHeight = isAndroid && index === 0 ? 123 : 67;
      const peekOffset = screen.height < 800 ? 158 : screen.height / 3;
      const pointerEvent = this.state.storyTopsClickable[index]
        ? "none"
        : "auto";
      const peekOffsetStyle: CSSProperties = {
        height: `${peekOffset}px`,
        top: `-${peekHeight}px`,
        pointerEvents: pointerEvent,
      };

      // When email form is not visible, set padding botttom to 200px on the last story card
      const emailCapturedBottomStyle =
        stories.length === index + 1 && !showEmailForm
          ? { paddingBottom: `200px` }
          : { paddingBottom: `0` };

      return (
        <Scene
          loglevel={0}
          indicators={false}
          key={`storyitem${storyIndex}`}
          triggerHook="onLeave"
          pin
          /** There is something weird going on with react-scrollmagic types that
           * keeps giving us an error, but we can't change this component or update
           * the dependency or else it breaks!
           */
          // @ts-ignore
          pinSettings={{ pushFollowers: false }}
          duration={storyDuration}
          offset={storySceneOffset}
          ref={(element) => {
            if (element) {
              this.sceneRefs[index] = element;
            }
          }}
        >
          {(progress, event) => (
            <div>
              <div
                id={`story-card-${index}`}
                className={`panel panel${storyIndex}`}
                style={emailCapturedBottomStyle}
              >
                <div
                  className={`story-title-click click-${index}`}
                  id={`${index}`}
                  style={peekOffsetStyle}
                  onClick={() => {
                    this.handleClickScroll(index, true);
                  }}
                />
                <StoryItem
                  key={`storyitem${storyIndex}`}
                  progress={progress}
                  sceneStatus={event}
                  storyIndex={index}
                  isLastStoryItem={index === stories.length - 1 ? true : false}
                  story={story}
                  storyTitle={storyTitle}
                  selectedLanguage={this.props.selectedLanguage}
                  onStoryReadComplete={this.onStoryReadComplete}
                  getSize={this.onStoryHeightReady}
                  statusCallback={this.storySceneCallback}
                  onVisChange={this.onVisibilityChange}
                />
              </div>
            </div>
          )}
        </Scene>
      );
    });
  };

  /** Changes whether or not the top of a story card is clickable */
  onVisibilityChange = (isVisible: boolean, storyIndex: number) => {
    this.setState((pState) => {
      const storyTopsClickable = { ...pState.storyTopsClickable };
      storyTopsClickable[storyIndex] = isVisible;

      return {
        ...pState,
        storyTopsClickable,
      };
    });
  };

  /* Renders the pins for the story cards to get pinned on */
  renderPinsEnter = () => {
    const { stories } = this.state;

    return stories.map((story, index) => {
      const storyEnterPinDuration =
        index > 0
          ? this.state.storyDurationsCurrent[index - 1] / 4 - 50
          : constants.INFO_CARD_DURATION + constants.CONTENT_OFFSET + 33;

      return (
        <Scene
          loglevel={0}
          key={`storytriggerenter${index + 1}`}
          /** There is something weird going on with react-scrollmagic types that
           * keeps giving us an error, but we can't change this component or update
           * the dependency or else it breaks!
           */
          // @ts-ignore
          pin={`#story-card-${index}`}
          triggerElement={`#story-card-${index}`}
          triggerHook="onEnter"
          indicators={false}
          duration={storyEnterPinDuration}
          offset="0"
          pinSettings={{
            pushFollowers: true,
            spacerClass: "scrollmagic-pin-spacer-pt",
          }}
        >
          <div id={`story-pin-enter-${index + 1}`} />
        </Scene>
      );
    });
  };

  /** Renders the email pin for the panel to get pinned on */
  renderEmailPin = () => {
    const duration = screen.height < 800 ? 800 : screen.height;
    const offsettedDuration = duration + this.artworkScrollOffset - 150;

    return (
      <Scene
        loglevel={0}
        /** There is something weird going on with react-scrollmagic types that
         * keeps giving us an error, but we can't change this component or update
         * the dependency or else it breaks!
         */
        // @ts-ignore
        pin={`#email-panel`}
        triggerElement={`#email-panel`}
        triggerHook="onEnter"
        indicators={false}
        duration={offsettedDuration}
        offset="0"
        pinSettings={{
          pushFollowers: true,
          spacerClass: "scrollmagic-pin-spacer-pt",
        }}
      >
        <div id={`story-pin-enter`} />
      </Scene>
    );
  };

  /** For Android, scroll within the fixed container .sm-container because of card peek issue */
  renderStoryContainer = () => {
    const { showTitleBar, showStory } = this.state;
    const { showEmailForm } = this.props;
    const showEmailPin = !showStory && showEmailForm ? true : false;

    // Props for the controller, add container prop for Android
    const controllerProps = { refreshInterval: 250 };
    if (isAndroid) {
      controllerProps["container"] = ".sm-container";
    }

    return (
      <Controller {...controllerProps}>
        {/* Render these components conditionally, otherwise render empty divs */}
        {showTitleBar ? (
          <StoryTitle
            langOptions={this.props.langOptions}
            selectedLanguage={this.props.selectedLanguage}
            onSelectLanguage={this.onSelectLanguage}
          />
        ) : (
          <div />
        )}
        {showEmailPin ? this.renderEmailPin() : <div />}
        {showStory ? this.renderPinsEnter() : <div />}
        {showStory ? this.renderStory() : <div />}
      </Controller>
    );
  };

  /** Responsible for rendering the entirety of the page */
  renderResult = () => {
    const { showStory, emailCardClickable } = this.state;
    const { emailCaptureAck, showEmailForm } = this.props;
    const hasChildCards = showStory || !emailCaptureAck;

    return (
      <SectionWipesStyled hasChildCards={hasChildCards}>
        <ResultCard
          // @ts-ignore
          artwork={this.props.artwork}
          refCallbackInfo={this.refCallbackInfo}
          setArtworkRef={this.setArtworkRef}
          langOptions={this.props.langOptions}
          selectedLanguage={this.props.selectedLanguage}
          onSelectLanguage={this.onSelectLanguage}
          specialExhibition={this.props.result.data.specialExhibition}
          getTranslation={this.props.getTranslation}
        />

        {this.renderStoryContainer()}

        {/** Placeholder element to control email card enter when no stories are available. Only show when email has not been captured */}
        {showEmailForm && (
          <div
            id="email-trigger-enter"
            style={{ visibility: `hidden`, bottom: 0 }}
          />
        )}

        {/** If email was captured, show just the scan button. Otherwise, render the email screen */}
        {showEmailForm ? (
          <EmailForm
            withStory={showStory}
            isEmailScreen={false}
            onSubmitEmail={this.props.onSubmitEmail}
            getTranslation={this.props.getTranslation}
            getSize={this.onEmailHeightReady}
            pointerEvents={emailCardClickable ? "auto" : "none"}
            handleClickScroll={this.handleClickScroll}
          />
        ) : (
          <div>
            {" "}
            <ScanButton />{" "}
          </div>
        )}
      </SectionWipesStyled>
    );
  };

  render() {
    const { imgLoaded, loaded } = this.state;
    if (!loaded) {
      return null;
    }
    return (
      <div className={isAndroid ? "sm-container" : "ios-container"}>
        {!imgLoaded && (
          <div style={{ visibility: `hidden` }}>
            <img
              className="card-img-result"
              src={this.props.artwork.url}
              alt="match_image"
              onLoad={this.onArtworkImgLoad}
            />
          </div>
        )}
        {this.state.imgLoaded && this.renderResult()}
      </div>
    );
  }
}

export default compose<ArtworkWithStory>(
  withOrientation,
  withTranslation,
  withRouter
)(ArtworkWithStory);
