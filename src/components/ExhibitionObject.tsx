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
import classnames from "classnames";

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
import { Controller, Scene } from "react-scrollmagic";
import { EmailForm } from "./EmailForm";
import { EmailFormInput } from "./EmailFormInput";

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
  const [emailSubmitTimeoutCallback, setEmailSubmitTimeoutCallback] =
    useState<NodeJS.Timeout>();
  const [emailCardClickable, setEmailCardClickable] = useState(true);
  const [emailFormHeight, setEmailFormHeight] = useState<number>();
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const resultCard = useRef<HTMLDivElement>();

  const location = useLocation();
  const { getLocalStorage } = useLocalStorage();

  const onSelectLanguage = async (selectedLanguage: LanguageOptionType) => {
    // Scroll to top when language changes. This should help re-calculate correct offsets on language change
    window.scroll({ top: 0, behavior: "smooth" });

    // Update local storage with the new set language and then update the server session
    await updateSelectedLanguage(selectedLanguage);

    // Get the new language translations
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

  /** Handles the tap-to-scroll functionality for cards */
  const handleClickScroll = () => {
    setEmailFormOpen(!emailFormOpen);
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
    };

    componentWillMount();
  }, []);

  useEffect(() => {
    debugger;
    if (resultCard.current) {
      debugger;
      console.log(resultCard.current?.getBoundingClientRect());
    }
  }, [resultCard]);

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
            <div className="exhibition-obj">
              <div className="result-card" ref={resultCard}>
                <ResultCard
                  artwork={artwork}
                  langOptions={langOptions}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={onSelectLanguage}
                  specialExhibition={result.data.specialExhibition}
                  getTranslation={getTranslation}
                />
              </div>

              {showEmailForm ? (
                <div
                  className={classnames("email-card", {
                    "email-card__open": emailFormOpen,
                  })}
                >
                  <EmailForm
                    withStory={false}
                    isEmailScreen={false}
                    onSubmitEmail={onSubmitEmail}
                    getTranslation={getTranslation}
                    getSize={onEmailHeightReady}
                    pointerEvents={emailCardClickable ? "auto" : "none"}
                    handleClickScroll={handleClickScroll}
                  />
                </div>
              ) : (
                <ScanButton />
              )}
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
};

export const ExhibitionObject = withTranslation(ExhibitionObjectComponent);
