import React from "react";
import ProgressiveImage from "react-progressive-image";
import { LANGUAGE_EN, SNAP_LANGUAGE_PREFERENCE } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LanguageOptionType, WithTranslationState } from "./withTranslation";
import { ArtworkObject } from "../types/payloadTypes";
import { LanguageDropdown } from "./LanguageDropdown";
import { Share } from "./Share";
import { ContentBlock } from "./ContentBlock";

export type ResultCardProps = {
  artwork: ArtworkObject;
  refCallbackInfo: (element: HTMLDivElement) => void;
  setArtworkRef: (element: HTMLDivElement) => void;
  langOptions: WithTranslationState["langOptions"];
  selectedLanguage: LanguageOptionType;
  onSelectLanguage: (item: LanguageOptionType) => void;
  specialExhibition: boolean;
  getTranslation: WithTranslationState["getTranslation"];
};

export const ResultCard: React.FC<ResultCardProps> = ({
  artwork,
  refCallbackInfo,
  setArtworkRef,
  langOptions,
  selectedLanguage,
  onSelectLanguage,
  specialExhibition,
  getTranslation,
}) => {
  const { getLocalStorage } = useLocalStorage();

  // Russian language renders differently, so we need to override the default font size
  const shortDescFontStyle =
    getLocalStorage(SNAP_LANGUAGE_PREFERENCE) === "Ru"
      ? { fontSize: `14px` }
      : {};

  return (
    <div className="container-fluid artwork-container" id="search-result">
      <div className="row" ref={refCallbackInfo}>
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
            data-nodesc-invno={!artwork.shortDescription ? artwork.invno : ""}
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
                        aria-label={`${artwork.title} by ${artwork.artist}${
                          artwork.culture ? `, ${artwork.culture}.` : "."
                        } ${artwork.visualDescription}`}
                      />
                    )}
                  </ProgressiveImage>
                </div>
                <div className="card-artist">{artwork.artist}</div>
                <div className="card-title">{artwork.title}</div>
              </div>
            </div>
            <div
              className="card-body"
              id="focussed-artwork-body"
              ref={setArtworkRef}
            >
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
                {!specialExhibition && (
                  <Share
                    shareText={getTranslation("Result_page", "text_1")}
                    artwork={artwork}
                  />
                )}
              </div>

              <div className="short-desc-container">
                {artwork.shortDescription && !artwork.content && (
                  <div
                    className="card-text paragraph"
                    style={shortDescFontStyle}
                    dangerouslySetInnerHTML={{
                      __html: artwork.shortDescription,
                    }}
                  ></div>
                )}

                {/* Add in new component for Content blocks */}
                {artwork.content && (
                  <div className="card-content">
                    {artwork.content.map((c, index) => (
                      <ContentBlock contentBlock={c.contentBlock} key={index} />
                    ))}
                  </div>
                )}
              </div>

              {artwork.shortDescription &&
                selectedLanguage.code !== LANGUAGE_EN && (
                  <div className="google-translate-disclaimer">
                    Translated with AWS
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
                          {`${getTranslation("Result_page", "text_10")}:`}
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
                      <td className="text-left item-info">{artwork.title}</td>
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
                      <td className="text-left item-info">{artwork.medium}</td>
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
                          {`${getTranslation("Result_page", "text_8")}:`}
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
    </div>
  );
};
