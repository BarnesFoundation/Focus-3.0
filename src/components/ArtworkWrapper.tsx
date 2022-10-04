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
import {
  constructResultAndInRoomSlider,
  constructStory,
} from "../helpers/artWorkHelper";
import {
  ArtworkObject,
  ArtWorkRecordsResult,
  StoryResponse,
} from "../types/payloadTypes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { EmailForm } from "./EmailForm";
import ProgressiveImage from "react-progressive-image";
import { LanguageDropdown } from "./LanguageDropdown";
import { Share } from "./Share";
import { ContentBlock } from "./ContentBlock";
import google_logo from "../images/google_translate.svg";
import { ScanButton } from "./ScanButton";
import Artwork from "./Artwork";
import { ExhibitionObject } from "./ExhibitionObject";

export const ArtworkWrapperComponent: React.FC<WithTranslationState> = ({
  getSelectedLanguage,
}) => {
  // Initialize the search request services
  const sr = new SearchRequestService();
  // Component state
  const [imageId, setImageId] = useState<string>();
  const [artwork, setArtwork] = useState<ArtworkObject["artwork"]>();
  const [result, setResult] = useState<ArtWorkRecordsResult>();
  const [stories, setStories] = useState<StoryResponse>();
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

  const setupStory = async (imageId) => {
    const storyInformation = await sr.getStoryItems(imageId);
    return constructStory(storyInformation);
  };

  // Set state and get object data on component initialization
  useEffect(() => {
    const componentWillMount = async () => {
      let artworkInfo: ArtWorkRecordsResult;
      let storyResponse: StoryResponse;
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
          [artworkInfo, storyResponse] = await Promise.all([
            sr.getArtworkInformation(imageId),
            setupStory(imageId),
          ]);
        } else if (path === "exhibition") {
          artworkInfo = await sr.getSpecialExhibitionObject(imageId);
        }
      }

      const { artwork, roomRecords } = constructResultAndInRoomSlider(
        artworkInfo,
        isTablet
      );

      setResult(artworkInfo);
      setArtwork(artwork);
      setStories(storyResponse);
      setImageId(imageId);

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
        (result.data.showStory ? (
          <Artwork />
        ) : (
          <ExhibitionObject
            initArtwork={artwork}
            initResult={result}
            imageId={imageId}
          />
        ))}
    </Fragment>
  );
};

export const ArtworkWrapper = withTranslation(ArtworkWrapperComponent);
