import React, { Fragment, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import classnames from "classnames";
import { isTablet } from "react-device-detect";
import { isAndroid } from "react-device-detect";

import { SearchRequestService } from "../services/SearchRequestService";
import * as constants from "../constants";
import withTranslation, {
  LanguageOptionType,
  WithTranslationState,
} from "./withTranslation";
import { constructResultAndInRoomSlider } from "../helpers/artWorkHelper";
import { ArtworkObject, ArtWorkRecordsResult } from "../types/payloadTypes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { EmailForm } from "./EmailForm";
import ProgressiveImage from "react-progressive-image";
import { LanguageDropdown } from "./LanguageDropdown";
import { Share } from "./Share";
import { ContentBlock } from "./ContentBlock";
import google_logo from "../images/google_translate.svg";
import { ScanButton } from "./ScanButton";

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

  const location = useLocation();
  const { getLocalStorage } = useLocalStorage();

  const [formOpen, setFormOpen] = useState(false);
  const startYCard2 = useRef<number>();
  const startYTrigger = useRef<number>();

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

  /** Updates state that email was captured and submits it to the server session */
  const onSubmitEmail = (email) => {
    setEmailCaptured(true);

    // Store the email
    sr.submitBookmarksEmail(email);

    // Close the email card after 4 seconds
    setTimeout(() => {
      setFormOpen(false);
      setEmailCaptureAck(true);
    }, 4000);
  };

  const handleClick = () => {
    if (!formOpen) setFormOpen(true);
  };

  const handleStartSwipe = (event) => {
    const touch = event.changedTouches[0];
    startYCard2.current = touch.pageY;
  };

  const handleSwipeDismiss = (event) => {
    const touch = event.changedTouches[0];
    const endY = touch.pageY;
    if (endY > startYCard2.current) setFormOpen(false);
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
    if (!artwork || !imgLoaded || !showEmailForm) return;

    // Add handlers for card-2 swipe down interaction
    const content = document.getElementById("card-content");
    content.addEventListener("touchstart", handleStartSwipe);
    content.addEventListener("touchend", handleSwipeDismiss);
    content.addEventListener("wheel", (e) => {
      if (e.deltaY < 0) {
        setFormOpen(false);
      }
    });

    // Disable scrolling inside element
    const card2 = document.getElementById("card-2");
    card2.addEventListener("touchmove", (e) => e.preventDefault());

    // Trigger to open card-2 once bottom of content is reached
    const trigger = document.getElementById("card-2__trigger");
    trigger.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        setFormOpen(true);
      }
    });
    trigger.addEventListener("touchstart", (e) => {
      startYTrigger.current = e.changedTouches[0].pageY;
    });
    trigger.addEventListener("touchend", (e) => {
      if (e.changedTouches[0].pageY < startYTrigger.current) setFormOpen(true);
    });
  }, [artwork, imgLoaded, showEmailForm]);

  return (
    <div
      id="container"
      className={classnames(
        "exhibition-obj",
        isAndroid ? "sm-container" : "ios-container"
      )}
    >
      {artwork && (
        <div id="card-content" className="exhibition-obj__content">
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
            <Fragment>
              <div id="card-1" className="exhibition-obj__content__result">
                <div className="row">
                  <div className="artwork-top-bg">
                    <img
                      className="card-img-top"
                      src={artwork.bg_url}
                      alt="match_image_background"
                      aria-hidden={true}
                    />
                  </div>
                  <div className="col-12 col-md-12">
                    <div
                      id="result-card"
                      className="card"
                      data-title={artwork.title}
                      data-artist={artwork.artist}
                      data-id={artwork.id}
                      data-invno={artwork.invno}
                      data-nodesc-invno={
                        !artwork.shortDescription ? artwork.invno : ""
                      }
                    >
                      <div className="card-top-container">
                        <div className="card-img-overlay">
                          <div className="card-header h1">Focused Artwork</div>
                          <div className="card-img-result">
                            {/* @ts-ignore */}
                            <ProgressiveImage
                              src={artwork.url}
                              placeholder={artwork.url_low_quality}
                            >
                              {(src) => (
                                <img
                                  src={src}
                                  alt="match_image"
                                  role="img"
                                  aria-label={`${artwork.title} by ${
                                    artwork.artist
                                  }${
                                    artwork.culture
                                      ? `, ${artwork.culture}.`
                                      : "."
                                  } ${artwork.visualDescription}`}
                                />
                              )}
                            </ProgressiveImage>
                          </div>
                          <div className="card-artist">{artwork.artist}</div>
                          <div className="card-title">{artwork.title}</div>
                        </div>
                      </div>
                      <div className="card-body" id="focussed-artwork-body">
                        <div className="share-wrapper">
                          {/* Language options button */}
                          <div className="language-dropdown-wrapper">
                            <div className="language-dropdown">
                              <LanguageDropdown
                                langOptions={langOptions}
                                selected={selectedLanguage}
                                onSelectLanguage={onSelectLanguage}
                              />
                            </div>
                          </div>

                          {/* Share options button for Barnes Collection objects */}
                          {/* TODO: determine if we want share button for special exhibition objects */}
                          {!result.data.specialExhibition && (
                            <Share
                              shareText={getTranslation(
                                "Result_page",
                                "text_1"
                              )}
                              artwork={artwork}
                            />
                          )}
                        </div>

                        <div className="short-desc-container">
                          {/* Content blocks from Hygraph CMS */}
                          {artwork.content && (
                            <div className="card-content">
                              {artwork.content.map((c, index) => (
                                <ContentBlock
                                  contentBlock={c.contentBlock}
                                  key={index}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {(artwork.shortDescription || artwork.content) &&
                          selectedLanguage.code !== constants.LANGUAGE_EN && (
                            <div className="google-translate-disclaimer">
                              <span>Translated with </span>
                              <img src={google_logo} alt="google_logo" />
                            </div>
                          )}
                        <div className="card-info">
                          <table className="detail-table">
                            <tbody>
                              <tr>
                                <td className="text-left item-label">{`${getTranslation(
                                  "Result_page",
                                  "text_3"
                                )}:`}</td>
                                <td className="text-left item-info">
                                  {artwork.artist}{" "}
                                  {!artwork.unIdentified && artwork.nationality
                                    ? `(${artwork.nationality}, ${artwork.birthDate} - ${artwork.deathDate})`
                                    : ""}
                                </td>
                              </tr>
                              {artwork.unIdentified && (
                                <tr>
                                  <td className="text-left item-label">
                                    {`${getTranslation(
                                      "Result_page",
                                      "text_10"
                                    )}:`}
                                  </td>
                                  <td className="text-left item-info">
                                    {artwork.culture}
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td className="text-left item-label">{`${getTranslation(
                                  "Result_page",
                                  "text_4"
                                )}:`}</td>
                                <td className="text-left item-info">
                                  {artwork.title}
                                </td>
                              </tr>
                              <tr>
                                <td className="text-left item-label">{`${getTranslation(
                                  "Result_page",
                                  "text_5"
                                )}:`}</td>
                                <td className="text-left item-info">
                                  {artwork.displayDate}
                                </td>
                              </tr>
                              <tr>
                                <td className="text-left item-label">{`${getTranslation(
                                  "Result_page",
                                  "text_6"
                                )}:`}</td>
                                <td className="text-left item-info">
                                  {artwork.medium}
                                </td>
                              </tr>
                              <tr>
                                <td className="text-left item-label">{`${getTranslation(
                                  "Result_page",
                                  "text_7"
                                )}:`}</td>
                                <td className="text-left item-info">
                                  {artwork.dimensions}
                                </td>
                              </tr>
                              {!artwork.curatorialApproval && (
                                <tr>
                                  <td className="text-left item-label">
                                    {`${getTranslation(
                                      "Result_page",
                                      "text_8"
                                    )}:`}
                                  </td>
                                  <td className="text-left item-info">
                                    {getTranslation("Result_page", "text_9")}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="card-2__trigger" />
              </div>
              {showEmailForm ? (
                <div
                  id="card-2"
                  className={classnames(
                    "exhibition-obj__content__email",
                    "card",
                    {
                      open: formOpen,
                      completed: !formOpen && emailCaptured,
                    }
                  )}
                  onClick={handleClick}
                >
                  <EmailForm
                    withStory={false}
                    isEmailScreen={false}
                    onSubmitEmail={onSubmitEmail}
                    getTranslation={getTranslation}
                    getSize={(height) => null}
                    pointerEvents="auto"
                    handleClickScroll={(storyIndex, isStoryCard) => null}
                    alwaysFloatBtn={!emailCaptureAck}
                  />
                </div>
              ) : (
                <ScanButton float={false} />
              )}
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
};

export const ExhibitionObject = withTranslation(ExhibitionObjectComponent);
