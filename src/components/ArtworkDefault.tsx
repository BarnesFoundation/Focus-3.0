import React, { Fragment, useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { isAndroid } from "react-device-detect";

import { LANGUAGE_EN } from "../constants";
import withTranslation, {
  LanguageOptionType,
  WithTranslationState,
} from "./withTranslation";
import { ArtworkObject, ArtWorkRecordsResult } from "../types/payloadTypes";
import { EmailForm } from "./EmailForm";
import ProgressiveImage from "react-progressive-image";
import { LanguageDropdown } from "./LanguageDropdown";
import { Share } from "./Share";
import { ContentBlock } from "./ContentBlock";
import google_logo from "../images/google_translate.svg";
import { ScanButton } from "./ScanButton";

type ArtworkDefaultProps = {
  artwork: ArtworkObject;
  result: ArtWorkRecordsResult;
  onSelectLanguage: (selectedLanguage: LanguageOptionType) => void;
  selectedLanguage: LanguageOptionType;
  emailCaptured: boolean;
  showEmailForm: boolean;
  onSubmitEmail: (email: string, callback?: (args?: any) => void) => void;
} & WithTranslationState;

export const ArtworkDefaultComponent: React.FC<ArtworkDefaultProps> = ({
  artwork,
  result,
  onSelectLanguage,
  selectedLanguage,
  emailCaptured,
  showEmailForm,
  onSubmitEmail,
  langOptions,
  getTranslation,
}) => {
  // Component state
  const [imgLoaded, setImgLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const startYCard2 = useRef<number>();
  const startYTrigger = useRef<number>();

  /** Updates state that email was captured and submits it to the server session */
  const handleSubmitEmail = (email: string) => {
    onSubmitEmail(email, () => setFormOpen(false));
  };

  const handleClick = () => {
    if (!formOpen) setFormOpen(true);
  };

  const handleStartSwipe = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    startYCard2.current = touch.pageY;
  };

  const handleSwipeDismiss = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    const endY = touch.pageY;
    if (endY > startYCard2.current) setFormOpen(false);
  };

  useEffect(() => {
    if (!imgLoaded || !showEmailForm) return;

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
    card2.addEventListener("touchmove", (e: TouchEvent) => e.preventDefault());

    // Trigger to open card-2 once bottom of content is reached
    const trigger = document.getElementById("card-2__trigger");
    trigger.addEventListener("wheel", (e: WheelEvent) => {
      if (e.deltaY > 0) {
        setFormOpen(true);
      }
    });
    trigger.addEventListener("touchstart", (e: TouchEvent) => {
      startYTrigger.current = e.changedTouches[0].pageY;
    });
    trigger.addEventListener("touchend", (e: TouchEvent) => {
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
                            shareText={getTranslation("Result_page", "text_1")}
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

                      {artwork.content &&
                        selectedLanguage.code !== LANGUAGE_EN && (
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
                  onSubmitEmail={handleSubmitEmail}
                  getTranslation={getTranslation}
                  getSize={(height) => null}
                  pointerEvents="auto"
                  handleClickScroll={(storyIndex, isStoryCard) => null}
                  alwaysFloatBtn={true}
                />
              </div>
            ) : (
              <ScanButton float={false} />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export const ArtworkDefault = withTranslation<ArtworkDefaultProps>(
  ArtworkDefaultComponent
);
