import React, { Fragment, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { isTablet } from "react-device-detect";

import { SearchRequestService } from "../services/SearchRequestService";
import * as constants from "../constants";
import withTranslation, {
  LanguageOptionType,
  WithTranslationState,
} from "./withTranslation";
import { constructResultAndInRoomSlider } from "../helpers/artWorkHelper";
import { ArtworkObject, ArtWorkRecordsResult } from "../types/payloadTypes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import ArtworkWithStory from "./ArtworkWithStory";
import { ArtworkDefault } from "./ArtworkDefault";

export const ArtworkWrapperComponent: React.FC<WithTranslationState> = ({
  getSelectedLanguage,
  updateSelectedLanguage,
  langOptions,
  getTranslation,
}) => {
  // Initialize the search request services
  const sr = new SearchRequestService();
  // Component state
  const [imageId, setImageId] = useState<string>();
  const [artwork, setArtwork] = useState<ArtworkObject>();
  const [result, setResult] = useState<ArtWorkRecordsResult>();
  const [specialExhibition, setSpecialExhibition] = useState<boolean>();
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

  const onSelectLanguage = async (selectedLanguage: LanguageOptionType) => {
    // Scroll to top when language changes. This should help re-calculate correct offsets on language change
    window.scroll({ top: 0, behavior: "smooth" });

    // Update local storage with the new set language and then update the server session
    await updateSelectedLanguage(selectedLanguage);

    let artworkInfo: ArtWorkRecordsResult;

    // Get the new language translations
    if (specialExhibition) {
      artworkInfo = await sr.getSpecialExhibitionObject(imageId);
    } else {
      artworkInfo = await sr.getArtworkInformation(imageId);
    }

    const artwork = artworkInfo
      ? constructResultAndInRoomSlider(artworkInfo, isTablet)
      : undefined;

    setResult(artworkInfo);
    setArtwork(artwork);
    setSelectedLanguage(selectedLanguage);
  };

  /** Updates state that email was captured and submits it to the server session */
  const onSubmitEmail = (email: string, callback?: (args?: any) => void) => {
    setEmailCaptured(true);

    // Store the email
    sr.submitBookmarksEmail(email);

    // Close the email card after 4 seconds
    setTimeout(() => {
      callback();
      setEmailCaptureAck(true);
    }, 4000);
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
        const [_n, path, id] = location.pathname.split("/");
        imageId = id;

        if (path === "artwork") {
          artworkInfo = await sr.getArtworkInformation(imageId);
        } else if (path === "exhibition") {
          artworkInfo = await sr.getSpecialExhibitionObject(imageId);
        }
      }

      const artwork = constructResultAndInRoomSlider(artworkInfo, isTablet);

      setResult(artworkInfo);
      setArtwork(artwork);
      setImageId(imageId);
      setSpecialExhibition(artworkInfo.data.specialExhibition);

      const emailRecorded = getLocalStorage(constants.SNAP_USER_EMAIL) !== null;
      setEmailCaptured(emailRecorded);
      setShowEmailForm(!emailRecorded);
      setEmailCaptureAck(emailRecorded);
      setSelectedLanguage((await getSelectedLanguage())[0]);
    };

    componentWillMount();
  }, []);

  return (
    <Fragment>
      {result &&
        artwork &&
        imageId &&
        (result.data.showStory ? (
          <ArtworkWithStory
            artwork={artwork}
            result={result}
            imageId={imageId}
            onSelectLanguage={onSelectLanguage}
            selectedLanguage={selectedLanguage}
            emailCaptured={emailCaptured}
            showEmailForm={showEmailForm}
            emailCaptureAck={emailCaptureAck}
            onSubmitEmail={onSubmitEmail}
            langOptions={langOptions}
            getTranslation={getTranslation}
          />
        ) : (
          <ArtworkDefault
            artwork={artwork}
            result={result}
            onSelectLanguage={onSelectLanguage}
            selectedLanguage={selectedLanguage}
            emailCaptured={emailCaptured}
            showEmailForm={showEmailForm}
            onSubmitEmail={onSubmitEmail}
            langOptions={langOptions}
            getTranslation={getTranslation}
          />
        ))}
    </Fragment>
  );
};

export const ArtworkWrapper = withTranslation(ArtworkWrapperComponent);
