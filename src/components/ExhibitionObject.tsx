import React, { Component } from "react";
import { withRouter } from "react-router";
import { History, Match } from "react-router-dom";
import { compose } from "redux";
import $ from "jquery";

import * as constants from "../constants";
import withOrientation from "./withOrientation";
import withTranslation, {
  LanguageOptionType,
  WithTranslationState,
} from "./withTranslation";

import { EmailForm } from "./EmailForm";

import { SearchRequestService } from "../services/SearchRequestService";
import { Controller, Scene } from "react-scrollmagic";
// @ts-ignore
import styled, { css } from "styled-components";
import { isTablet } from "react-device-detect";
// @ts-ignore
import ScrollMagic from "scrollmagic";
import { isAndroid, isIOS } from "react-device-detect";

import { ScanButton } from "./ScanButton";
import { ResultCard } from "./ResultCard";
import {
  constructResultAndInRoomSlider,
  constructStory,
} from "../helpers/artWorkHelper";
import { ArtworkObject, ArtWorkRecordsResult } from "../types/payloadTypes";

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

type ExhibitionObjectProps = {
  match: Match;
  history: History;
} & WithTranslationState;

type ExhibitionObjectState = {
  emailCaptured: boolean;
  showEmailForm: boolean;
  emailCaptureAck: boolean;
  imgLoaded: boolean;
  email: string;
  emailCardClickable: boolean;
  result: ArtWorkRecordsResult;
  selectedLanguage: LanguageOptionType;
  artwork: ArtworkObject["artwork"];
  roomRecords: ArtworkObject["roomRecords"];
};

export class ExhibitionObject extends Component<
  ExhibitionObjectProps,
  ExhibitionObjectState
> {
  sr: SearchRequestService;
  artworkScene;
  emailScene;
  emailSceneTrigger;
  artworkRef;
  infoCardRef;
  sceneRefs: {};
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
    this.sceneRefs = {};

    this.artworkScrollOffset = 0;

    this.state = {
      ...props.location.state,
      emailCaptured: false,
      showEmailForm: true,
      emailCaptureAck: false,
      imgLoaded: false,
      email: localStorage.getItem(constants.SNAP_USER_EMAIL) || "",
      showTitleBar: false,
      emailCardClickable: true,
    };

    this.artworkTimeoutCallback = null;
    this.emailSubmitTimeoutCallback = null;
  }

  async componentWillMount() {
    let imageId = this.state.result
      ? this.state.result.data.records[0].id
      : this.props.match.params.imageId;
    const selectedLang = await this.props.getSelectedLanguage();
    const emailCaptured =
      localStorage.getItem(constants.SNAP_USER_EMAIL) !== null;

    const durationNextArr = [];
    const durDefault = 300;

    if (!this.state.result) {
      let artworkInfo, storyResponse;

      if (this.props.match.url.includes("artwork")) {
        [artworkInfo, storyResponse] = await Promise.all([
          this.sr.getArtworkInformation(imageId),
          this.setupStory(imageId),
        ]);
      } else if (this.props.match.url.includes("exhibition")) {
        [artworkInfo, storyResponse] = await Promise.all([
          this.sr.getSpecialExhibitionObject(imageId),
          this.setupStory(imageId),
        ]);
        console.log(artworkInfo);
      }

      const { artwork, roomRecords } = constructResultAndInRoomSlider(
        artworkInfo,
        isTablet
      );

      durationNextArr.push(durDefault);

      this.setState({
        selectedLanguage: selectedLang[0],
        result: artworkInfo,
        artwork: artwork,
        roomRecords: roomRecords,
        emailCaptured: emailCaptured,
        showEmailForm: !emailCaptured,
        emailCaptureAck: emailCaptured,
      });
    } else {
      const { artwork, roomRecords } = constructResultAndInRoomSlider(
        this.state.result,
        isTablet
      );

      durationNextArr.push(durDefault);

      this.setState({
        selectedLanguage: selectedLang[0],
        artwork: artwork,
        roomRecords: roomRecords,
        emailCaptured: emailCaptured,
        showEmailForm: !emailCaptured,
        emailCaptureAck: emailCaptured,
      });
    }
  }

  componentDidUpdate(_prevProps, prevState) {
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
      this.resetEmailSceneTriggerSettings();
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

  onSelectLanguage = async (selectedLanguage: LanguageOptionType) => {
    // Scroll to top when language changes. This should help re-calculate correct offsets on language change
    window.scroll({ top: 0, behavior: "smooth" });

    // Update local storage with the new set language and then update the server session
    await this.props.updateSelectedLanguage(selectedLanguage);

    // Get the new language translations
    const imageId = this.getFocusedArtworkImageId();
    const artworkInfo = await this.sr.getArtworkInformation(imageId);

    const { artwork, roomRecords } = artworkInfo
      ? constructResultAndInRoomSlider(artworkInfo, isTablet)
      : undefined;

    this.setState({
      result: artworkInfo,
      selectedLanguage,
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
    return constructStory(storyInformation);
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
        if (!this.state.emailCaptured) {
          this.setupEmailSceneOnEnter();
        }
        if (!this.state.emailCaptured) {
          this.setupEmailScene();
        }
      }, 0);
    }
  };

  onEmailHeightReady = (height) => {
    this.emailFormHeight = (height * 2) / 2.2;
  };

  refCallbackInfo = (element) => {
    if (element) {
      this.infoCardRef = element;
    }
  };

  onArtworkImgLoad = ({ target: img }) => {
    this.setState({ imgLoaded: true });
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
    const { showEmailForm } = this.state;

    // Props for the controller, add container prop for Android
    const controllerProps = { refreshInterval: 250 };
    if (isAndroid) {
      controllerProps["container"] = ".sm-container";
    }

    return (
      <Controller {...controllerProps}>
        {/* Render these components conditionally, otherwise render empty divs */}
        {showEmailForm ? this.renderEmailPin() : <div />}
      </Controller>
    );
  };

  /** Responsible for rendering the entirety of the page */
  renderResult = () => {
    const { emailCaptureAck, showEmailForm, emailCardClickable } = this.state;

    return (
      <SectionWipesStyled hasChildCards={!emailCaptureAck}>
        <ResultCard
          // @ts-ignore
          artwork={this.state.artwork}
          refCallbackInfo={this.refCallbackInfo}
          setArtworkRef={this.setArtworkRef}
          langOptions={this.props.langOptions}
          selectedLanguage={this.state.selectedLanguage}
          onSelectLanguage={this.onSelectLanguage}
          shortDescContainer={this.shortDescContainer}
          specialExhibition={this.state.result.data.specialExhibition}
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
            withStory={false}
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

export default compose<ExhibitionObject>(
  withOrientation,
  withTranslation,
  withRouter
)(ExhibitionObject);
