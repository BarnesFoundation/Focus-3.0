import React, {
  Component,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import $ from "jquery";

import * as constants from "../constants";
import withTranslation, {
  LanguageOptionType,
  WithTranslationState,
} from "./withTranslation";

import { SearchRequestService } from "../services/SearchRequestService";
// @ts-ignore
import styled, { css } from "styled-components";
import { isTablet } from "react-device-detect";
// @ts-ignore
import ScrollMagic from "scrollmagic";
import { isAndroid, isIOS } from "react-device-detect";

import { ScanButton } from "./ScanButton";
import { ResultCard } from "./ResultCard";
import { constructResultAndInRoomSlider } from "../helpers/artWorkHelper";
import { ArtworkObject, ArtWorkRecordsResult } from "../types/payloadTypes";
import { EmailCard } from "./EmailCard";
import { useLocalStorage } from "../hooks/useLocalStorage";

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

export const ExhibitionObjectComponent: React.FC<WithTranslationState> = ({
  langOptions,
  getSelectedLanguage,
  getTranslation,
  updateSelectedLanguage,
}) => {
  // Initialize the search request services
  const sr = new SearchRequestService();
  // Component state
  const [imageId, setImageId] = useState<string>();
  const [artwork, setArtwork] = useState<ArtworkObject["artwork"]>();
  const [result, setResult] = useState<ArtWorkRecordsResult>();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [emailCaptureAck, setEmailCaptureAck] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOptionType>({
    name: "English",
    code: "En",
    selected: true,
  });
  const [artworkScrollOffset, setArtworkScrollOffset] = useState(0);
  const [artworkTimeoutCallback, setArtworkTimeoutCallback] =
    useState<NodeJS.Timeout>();
  const [emailSubmitTimeoutCallback, setEmailSubmitTimeoutCallback] =
    useState<NodeJS.Timeout>();
  const [emailCardClickable, setEmailCardClickable] = useState(true);
  const [emailFormHeight, setEmailFormHeight] = useState<number>();
  // Scrollmagic
  const artworkScene = useRef<ScrollMagic.Scene>();
  const emailScene = useRef<ScrollMagic.Scene>();
  const emailSceneTrigger = useRef<ScrollMagic.Scene>();
  const controller = useRef<ScrollMagic.Controller>();

  const location = useLocation();
  const { getLocalStorage } = useLocalStorage();

  // Component Refs
  const infoCardRef = useRef<HTMLDivElement>();
  const artworkRef = useRef<HTMLDivElement>();
  const descriptionRef = useRef<HTMLDivElement>();

  const onSelectLanguage = async (selectedLanguage: LanguageOptionType) => {
    // Scroll to top when language changes. This should help re-calculate correct offsets on language change
    window.scroll({ top: 0, behavior: "smooth" });

    // Update local storage with the new set language and then update the server session
    await updateSelectedLanguage(selectedLanguage);

    // Get the new language translations
    // const imageId = this.getFocusedArtworkImageId();
    const artworkInfo = await sr.getSpecialExhibitionObject(imageId);

    const { artwork, roomRecords } = artworkInfo
      ? constructResultAndInRoomSlider(artworkInfo, isTablet)
      : undefined;

    setResult(artworkInfo);
    setSelectedLanguage(selectedLanguage);
    setArtwork(artwork);
  };

  const onEmailHeightReady = (height) => {
    setEmailFormHeight((height * 2) / 2.2);
  };

  /** Sets up the ScrollMagic scene for the artwork result section */
  const setupArtworkScene = useCallback(() => {
    // Calculate the vertical offset for the artwork result
    const artworkVerticalOffset = Math.max(
      Math.ceil(
        artworkRef.current.getBoundingClientRect().bottom -
        constants.VIEWPORT_HEIGHT
      ),
      0
    );
    const offset = artworkVerticalOffset + 150;
    setArtworkScrollOffset(offset);

    artworkScene.current = new ScrollMagic.Scene({
      triggerElement: "#search-result",
      triggerHook: "onLeave",
      duration: 0, // scroll distance
      offset,
    })
      .setPin("#search-result", { pushFollowers: false }) // pins the element for the the scene's duration
      .addTo(controller.current);
  }, [controller]);

  /** Sets up the ScrollMagic for the email panel */
  const setupEmailScene = useCallback(() => {
    emailScene.current = new ScrollMagic.Scene({
      triggerElement: "#email-panel",
      triggerHook: "onEnter",
      duration: 0, // scroll distance
      offset: emailFormHeight, // start this scene after scrolling for emailFormHeight px.
    })
      .on("leave", (event) => {
        setEmailCardClickable(true);
      })
      .on("enter", (event) => {
        setEmailCardClickable(false);
      })
      .addTo(controller.current);
  }, [controller, emailFormHeight]);

  /** Sets up the ScrollMagic scene for the email on-enter scene */
  const setupEmailSceneOnEnter = useCallback(() => {
    emailSceneTrigger.current = new ScrollMagic.Scene({
      triggerElement: "#email-trigger-enter",
      triggerHook: "onEnter",
      duration: artworkScrollOffset - 150,
    })
      .on("leave", (event) => {
        emailSceneTrigger.current.removePin();
        emailSceneTrigger.current.refresh();
      })
      .addTo(controller.current);
  }, [artworkScrollOffset, controller]);

  const resetArtworkSceneSettings = useCallback(() => {
    artworkScene.current.removePin(true);
    artworkScene.current.offset(artworkScrollOffset);
    artworkScene.current.setPin("#search-result");
    artworkScene.current.refresh();
  }, [artworkScene, artworkScrollOffset]);

  const resetEmailSceneTriggerSettings = useCallback(() => {
    if (emailSceneTrigger.current) {
      emailSceneTrigger.current.removePin();
      emailSceneTrigger.current.duration(artworkScrollOffset - 100);
      emailSceneTrigger.current.setPin("#email-trigger-enter");
      emailSceneTrigger.current.refresh();
    }
  }, [artworkScrollOffset, emailSceneTrigger]);

  /** Handles the tap-to-scroll functionality for cards */
  const handleClickScroll = () => {
    // Determine the offset needed for the height of each story card and the amount it should peek up
    let heightOffset = screen.height < 800 ? 800 : screen.height;
    let landingPoint = emailScene.current.scrollOffset() + heightOffset;

    // For iOS, override the normal scrolling
    if (isIOS) {
      controller.current.scrollTo((nextStoryPoint) => {
        $("html, body").animate({ scrollTop: nextStoryPoint });
      });
    }

    controller.current.scrollTo(landingPoint);
  };

  /** Updates state that email was captured and submits it to the server session */
  const onSubmitEmail = (email) => {
    setEmailCaptured(true);
    setEmailCaptureAck(true);

    // Store the email
    sr.submitBookmarksEmail(email);

    // Close the email card after 4 seconds
    const timeout = setTimeout(() => {
      setEmailCaptureAck(true);
    }, 4000);
    setEmailSubmitTimeoutCallback(timeout);
  };

  // Set state and get object data on component initialization
  useEffect(() => {
    const componentWillMount = async () => {
      let artworkInfo: ArtWorkRecordsResult;
      let imageId: string;

      // Check if result data is stored in location state from camera component
      if (location.state?.result) {
        imageId = location.state.result.data.records[0].id;
        artworkInfo = location.state.result;
      } else {
        // If result data is not in state, get image ID from path and get data from server
        const [_n, _path, id] = location.pathname.split("/");
        imageId = id;
        artworkInfo = await sr.getSpecialExhibitionObject(imageId);
      }

      const { artwork, roomRecords } = constructResultAndInRoomSlider(
        artworkInfo,
        isTablet
      );

      setResult(artworkInfo);
      setArtwork(artwork);
      setImageId(imageId);

      const emailRecorded = getLocalStorage(constants.SNAP_USER_EMAIL) !== null;
      setEmailCaptured(emailRecorded);
      setShowEmailForm(!emailRecorded);
      setEmailCaptureAck(emailRecorded);
      setSelectedLanguage((await getSelectedLanguage())[0]);

      const scrollContainer = isAndroid ? { container: ".sm-container" } : {};
      controller.current = new ScrollMagic.Controller(scrollContainer);
    };

    componentWillMount();
  }, []);

  // Update scrollmagic scene settings on component update
  useEffect(() => {
    if (!artworkRef.current) {
      return;
    } else {
      setupArtworkScene();

      const newOffset = Math.max(
        Math.ceil(
          artworkRef.current.getBoundingClientRect().bottom -
          constants.VIEWPORT_HEIGHT
        ),
        0
      );
      const offset = newOffset + 100;
      setArtworkScrollOffset(offset);
      console.log(
        "Setting new offset to Artwork scene on componentDidUpdate: ",
        Math.ceil(artworkRef.current.getBoundingClientRect().height),
        artworkScrollOffset
      );

      const timeout = setTimeout(() => {
        setupArtworkScene();
        if (!emailCaptured) {
          setupEmailSceneOnEnter();
          setupEmailScene();
        }
      }, 0);

      setArtworkTimeoutCallback(timeout);

      if (artworkScene) resetArtworkSceneSettings();
      resetEmailSceneTriggerSettings();
    }
  }, [
    artworkRef,
    selectedLanguage,
    setupArtworkScene,
    artworkScrollOffset,
    emailCaptured,
    resetArtworkSceneSettings,
    resetEmailSceneTriggerSettings,
    setupEmailScene,
    setupEmailSceneOnEnter,
    artworkScene,
  ]);

  // Clean up scrollmagic on unmount
  useEffect(() => {
    return () => {
      if (artworkTimeoutCallback) clearTimeout(artworkTimeoutCallback);
      setArtworkTimeoutCallback(null);

      if (emailSubmitTimeoutCallback) clearTimeout(emailSubmitTimeoutCallback);
      setEmailSubmitTimeoutCallback(null);

      if (artworkScene.current) {
        artworkScene.current.remove();
        artworkScene.current.destroy(true);
        artworkScene.current = null;
      }

      if (emailScene.current) {
        emailScene.current.remove();
        emailScene.current.destroy(true);
        emailScene.current = null;
      }

      if (emailSceneTrigger.current) {
        emailSceneTrigger.current.remove();
        emailSceneTrigger.current.destroy(true);
        emailSceneTrigger.current = null;
      }

      if (controller.current) {
        controller.current.destroy(true);
        controller.current = null;
      }
    };
  }, []);

  return (
    <Fragment>
      {artwork && (
        <div className={isAndroid ? "sm-container" : "ios-container"}>
          {!imgLoaded ? (
            <div style={{ visibility: "hidden" }}>
              <img
                className="card-img-result"
                src={artwork.url}
                alt="match_image"
                onLoad={({ target: img }) => setImgLoaded(true)}
              />
            </div>
          ) : (
            <SectionWipesStyled hasChildCards={!emailCaptureAck}>
              <ResultCard
                // @ts-ignore
                artwork={artwork}
                infoCardRef={infoCardRef}
                artWorkRef={artworkRef}
                langOptions={langOptions}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={onSelectLanguage}
                descriptionRef={descriptionRef}
                specialExhibition={result.data.specialExhibition}
                getTranslation={getTranslation}
              />

              {/** If email was captured, show just the scan button. Otherwise, render the email screen */}
              {showEmailForm ? (
                <EmailCard
                  artworkScrollOffset={artworkScrollOffset}
                  emailCardClickable={emailCardClickable}
                  onSubmitEmail={onSubmitEmail}
                  onEmailHeightReady={onEmailHeightReady}
                  handleClickScroll={handleClickScroll}
                  getTranslation={getTranslation}
                />
              ) : (
                <ScanButton />
              )}
            </SectionWipesStyled>
          )}
        </div>
      )}
    </Fragment>
  );
};

export const ExhibitionObject = withTranslation(ExhibitionObjectComponent);
