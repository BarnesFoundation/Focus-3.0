import React, { Component, CSSProperties } from "react";
import { withRouter } from "react-router";
import { compose } from "redux";
import $ from "jquery";

import * as constants from "../constants";
import withOrientation from "./withOrientation";
import withTranslation from "./withTranslation";

import { EmailForm } from "./EmailForm";

import { SearchRequestService } from "../services/SearchRequestService";
import { Controller, Scene } from "react-scrollmagic";
// @ts-ignore
import styled, { css } from "styled-components";
import StoryItem from "./StoryItem";
import { isTablet } from "react-device-detect";
// @ts-ignore
import ScrollMagic from "scrollmagic";
import { isAndroid, isIOS } from "react-device-detect";

import { ScanButton } from "./ScanButton";
import { ResultCard } from "./ResultCard";
import { StoryTitle } from "./StoryTitle";
import {
  ArtworkComponentProps,
  ArtworkComponentState,
  LanguageOptionType,
} from "../types";

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

class Artwork extends Component<ArtworkComponentProps, ArtworkComponentState> {
  sr: SearchRequestService;
  artworkScene;
  emailScene;
  emailSceneTrigger;
  artworkRef;
  infoCardRef;
  emailCardRef;
  sceneRefs: {};
  contentOffset: number;
  artworkScrollOffset: number;
  langOptions: LanguageOptionType[];
  artworkTimeoutCallback;
  emailSubmitTimeoutCallback;
  controller;
  emailFormHeight: number;
  shortDescContainer;

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
    this.emailCardRef = null;
    this.sceneRefs = {};

    this.contentOffset = 67;
    this.artworkScrollOffset = 0;

    this.langOptions = [
      { name: "English", code: "En", selected: true },
      { name: "Español", code: "Es", selected: false },
      { name: "Français", code: "Fr", selected: false },
      { name: "Deutsch", code: "De", selected: false },
      { name: "Italiano", code: "It", selected: false },
      { name: "русский", code: "Ru", selected: false },
      { name: "中文", code: "Zh", selected: false },
      { name: "日本語", code: "Ja", selected: false },
      { name: "한국어", code: "Ko", selected: false },
    ];

    this.state = {
      ...props.location.state,
      showEmailScreen: false,
      emailCaptured: false,
      showEmailForm: true,
      emailCaptureAck: false,
      imgLoaded: false,
      alsoInRoomResults: [],
      email: localStorage.getItem(constants.SNAP_USER_EMAIL) || "",
      snapAttempts:
        parseInt(localStorage.getItem(constants.SNAP_ATTEMPTS)) || 1,
      errors: { email: false },
      showTitleBar: false,
      storyDuration: 250,
      infoHeightUpdated: false,
      infoCardDuration: 700,
      emailCardClickable: true,
      storyTopsClickable: {},
    };

    this.artworkTimeoutCallback = null;
    this.emailSubmitTimeoutCallback = null;
  }

  constructResultAndInRoomSlider = (artworkResult) => {
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

  async componentWillMount() {
    let imageId = this.state.result
      ? this.state.result.data.records[0].id
      : this.props.match.params.imageId;
    const selectedLang = await this.getSelectedLanguage();
    const emailCaptured =
      localStorage.getItem(constants.SNAP_USER_EMAIL) !== null;

    const durationCurArr = [];
    const durationNextArr = [];
    const storyPositionArr = [];
    const offsetArr = [];
    const durDefault = 300;

    if (!this.state.result) {
      const [artworkInfo, storyResponse] = await Promise.all([
        this.sr.getArtworkInformation(imageId),
        this.setupStory(imageId),
      ]);
      const { stories, storyId, storyTitle } = storyResponse;
      const { artwork, roomRecords } =
        this.constructResultAndInRoomSlider(artworkInfo);

      stories.forEach((story) => {
        durationCurArr.push(durDefault);
        offsetArr.push(durDefault);
        storyPositionArr.push(false);
      });
      durationNextArr.push(durDefault);

      this.setState({
        selectedLanguage: selectedLang[0],
        stories: stories,
        storyId: storyId,
        storyTitle: storyTitle,
        result: artworkInfo,
        showStory: artworkInfo.data.showStory,
        artwork: artwork,
        roomRecords: roomRecords,
        emailCaptured: emailCaptured,
        showEmailForm: !emailCaptured,
        emailCaptureAck: emailCaptured,
        storyDurationsCurrent: durationCurArr,
        storyOffsets: offsetArr,
      });
    } else {
      const { artwork, roomRecords } = this.constructResultAndInRoomSlider(
        this.state.result
      );
      const { stories, storyId, storyTitle } = await this.setupStory(imageId);

      stories.forEach((story) => {
        durationCurArr.push(durDefault);
        offsetArr.push(durDefault);
        storyPositionArr.push(false);
      });
      durationNextArr.push(durDefault);

      this.setState({
        selectedLanguage: selectedLang[0],
        stories: stories,
        storyId: storyId,
        storyTitle: storyTitle,
        showStory: this.state.result.data.show_story,
        artwork: artwork,
        roomRecords: roomRecords,
        emailCaptured: emailCaptured,
        showEmailForm: !emailCaptured,
        emailCaptureAck: emailCaptured,
        storyDurationsCurrent: durationCurArr,
        storyOffsets: offsetArr,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.artworkRef) {
      return;
    }
    if (prevState.selectedLanguage.code !== this.state.selectedLanguage.code) {
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
    if (this.emailSubmitTimeoutCallback)
      clearTimeout(this.emailSubmitTimeoutCallback);
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

  getSelectedLanguage = async () => {
    const selectedLangCode = localStorage.getItem(
      constants.SNAP_LANGUAGE_PREFERENCE
    );
    if (selectedLangCode !== null) {
      this.langOptions.map((option) => {
        if (option.code === selectedLangCode) {
          option.selected = true;
        } else {
          option.selected = false;
        }
      });
    }
    return this.langOptions.filter((lang) => lang.selected === true);
  };

  updateSelectedLanguage = (lang) => {
    this.langOptions.map((option) => {
      if (option.code === lang.code) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    });
  };

  onSelectLanguage = async (selectedLanguage) => {
    // Scroll to top when language changes. This should help re-calculate correct offsets on language change
    window.scroll({ top: 0, behavior: "smooth" });

    // Update local storage with the new set language and then update the server session
    localStorage.setItem(
      constants.SNAP_LANGUAGE_PREFERENCE,
      selectedLanguage.code
    );
    await this.sr.saveLanguagePreference(selectedLanguage.code);

    await this.props.updateTranslations();
    this.updateSelectedLanguage(selectedLanguage);

    // Get the new language translations
    const imageId = this.getFocusedArtworkImageId();
    const artworkInfo = await this.sr.getArtworkInformation(imageId);

    const { stories, storyId, storyTitle } = await this.setupStory(imageId);
    const { artwork, roomRecords } =
      this.constructResultAndInRoomSlider(artworkInfo);

    this.setState({
      result: artworkInfo,
      selectedLanguage,
      stories,
      storyId,
      storyTitle,
      artwork,
      roomRecords,
    });
  };

  getFocusedArtworkImageId = () => {
    return this.state.artwork
      ? this.state.artwork.id
      : this.props.match.params.imageId;
  };

  setupStory = async (imageId) => {
    const storyInformation = await this.sr.getStoryItems(imageId);
    let stories = [],
      storyId = undefined,
      storyTitle = undefined;

    if (storyInformation.data.total > 0) {
      ({ stories, story_title: storyTitle } = storyInformation.data.content);
      storyId = storyInformation.data.unique_identifier;
    }

    return { stories, storyId, storyTitle };
  };

  onSelectInRoomArt = (aitrId) => {
    localStorage.setItem(
      constants.SNAP_ATTEMPTS,
      (this.state.snapAttempts + 1).toString()
    );
    this.props.history.push({ pathname: `/artwork/${aitrId}` });
  };

  /** Updates state that email was captured and submits it to the server session */
  onSubmitEmail = (email) => {
    this.setState({
      email: email,
      emailCaptured: true,
      emailCaptureAck: true,
    });

    // Store the email
    this.sr.submitBookmarksEmail(email);

    // Close the email card after 4 secs
    this.emailSubmitTimeoutCallback = setTimeout(() => {
      this.setState({ emailCaptureAck: true });
    }, 4000);
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
  handleClickScroll = (storyIndex, isStoryCard) => {
    let landingPoint;

    // Determine the offset needed for the height of each story card and the amount it should peek up
    let heightOffset = screen.height < 800 ? 800 : screen.height;
    let peekOffset = screen.height < 800 ? 158 : screen.height / 3;

    // If the click originated from a story card
    if (isStoryCard) {
      // Amount needed for getting past the first card
      let initial = Math.abs(this.sceneRefs[0].props.duration) + peekOffset;

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

  setArtworkRef = (elem) => {
    if (elem) {
      this.artworkRef = elem;
      const scrollContainer = isAndroid ? { container: ".sm-container" } : {};
      this.controller = new ScrollMagic.Controller(scrollContainer);
      this.artworkTimeoutCallback = setTimeout(() => {
        this.setupArtworkScene();
        if (!this.state.showStory && !this.state.emailCaptured) {
          this.setupEmailSceneOnEnter();
        }
        if (!this.state.emailCaptured) {
          this.setupEmailScene();
        }
      }, 0);
    }
  };

  onStoryReadComplete = () => {
    const imageId = this.getFocusedArtworkImageId();
    const { storyId } = this.state;
    this.sr.markStoryAsRead(imageId, storyId);
  };

  onStoryHeightReady = (height, index) => {
    if (index > -1) {
      //console.log('Story durations based on height :: ', index, height);
      var durationCurArr = this.state.storyDurationsCurrent;
      durationCurArr[index] = index == 0 ? 0 : height;
      this.setState({ storyDurationsCurrent: durationCurArr });
    }
  };

  onEmailHeightReady = (height) => {
    this.emailFormHeight = (height * 2) / 2.2;
  };

  storySceneCallback = (showTitle) => {
    if (showTitle) {
      this.setState({ showTitleBar: true });
    } else {
      this.setState({ showTitleBar: false });
    }
  };

  refCallbackInfo = (element) => {
    if (element) {
      this.infoCardRef = element;
    }
  };

  onArtworkImgLoad = ({ target: img }) => {
    this.setState({ imgLoaded: true });
  };

  /** Renders each of the story cards */
  renderStory = () => {
    const { stories, storyTitle, showEmailForm } = this.state;

    // Iterate through the available stories
    return stories.map((story, index) => {
      const storyIndex = index + 1;
      const storyDuration = this.state.storyDurationsCurrent[index] * 5;
      const storySceneOffset =
        index > 0
          ? this.state.storyOffsets[index] - 342
          : this.state.infoCardDuration + 33;

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
                  selectedLanguage={this.state.selectedLanguage}
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
  onVisibilityChange = (isVisible, storyIndex) => {
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
          : this.state.infoCardDuration + this.contentOffset + 33;

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
    const { showTitleBar, showStory, showEmailForm } = this.state;
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
            langOptions={this.langOptions}
            selectedLanguage={this.state.selectedLanguage}
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
    const { showStory, emailCaptureAck, showEmailForm, emailCardClickable } =
      this.state;
    const hasChildCards = showStory || !emailCaptureAck;

    return (
      <SectionWipesStyled hasChildCards={hasChildCards}>
        <ResultCard
          artwork={this.state.artwork}
          refCallbackInfo={this.refCallbackInfo}
          setArtworkRef={this.setArtworkRef}
          langOptions={this.langOptions}
          selectedLanguage={this.state.selectedLanguage}
          onSelectLanguage={this.onSelectLanguage}
          shortDescContainer={this.shortDescContainer}
          specialExhibition={this.state.result.data.specialExhibition}
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
            onSubmitEmail={this.onSubmitEmail}
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
    const { artwork, imgLoaded } = this.state;
    if (!artwork) {
      return null;
    }
    return (
      <div className={isAndroid ? "sm-container" : "ios-container"}>
        {!imgLoaded && (
          <div style={{ visibility: `hidden` }}>
            <img
              className="card-img-result"
              src={this.state.artwork.url}
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

export default compose<Artwork>(
  withOrientation,
  withTranslation,
  withRouter
)(Artwork);
