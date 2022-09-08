import React, { useEffect, useState } from "react";
import { isAndroid, isIOS, isSafari, osVersion } from "react-device-detect";
import { useHistory } from "react-router-dom";
import { Textfit } from "react-textfit";

import { UnsupportedDialogue } from "./UnsupportedDialogue";
import * as constants from "../constants";
import home_background from "../images/barnes-v2-landing.png";
import barnes_logo from "../images/Barnes_logo.svg";
import barnes_100_logo from "../images/Barnes_100_logo.svg";
import close_icon from "../images/cross.svg";
import kf_logo from "../images/knight-foundation-logo.svg";

import { logiPhoneModel } from "../helpers/googleAnalyticsHelpers";
import { useLocalStorage } from "../hooks/useLocalStorage";
import withTranslation from "./withTranslation";
import { WithTranslationState } from "../types";

export const HomeComponent: React.FC<WithTranslationState> = ({
  getTranslation,
}) => {
  const { resetLocalStorage } = useLocalStorage();
  const history = useHistory();
  const [userAtBarnes, setUserAtBarnes] = useState(null);
  const [unsupportedIOSVersion, setUnsupportedIOSVersion] = useState(null);
  const [unsupportedIOSBrowser, setUnsupportedIOSBrowser] = useState(null);
  const [cameraAccessible, setCameraAccessible] = useState(null);
  const [showError, setShowError] = useState(false);
  // Get year to determine whether to use centennial logo or original logo
  const today = new Date();
  const isCentennial = today.getFullYear() === 2022;
  // Styles
  let homeContainerStyle =
    unsupportedIOSBrowser || unsupportedIOSVersion
      ? { filter: "blur(10px)", transform: "scale(1.2)" }
      : {};
  let visitOnlineLinkStyle =
    localStorage.getItem(constants.SNAP_LANGUAGE_PREFERENCE) === "Ja"
      ? { fontSize: `18px` }
      : {};

  useEffect(() => {
    resetLocalStorage();
  }, []);

  useEffect(() => {
    if (isIOS) {
      checkForGetUserMedia();
    }
  }, []);

  /** Determines if navigator.mediaDevices.getUserMedia() is available on the current iOS device */
  const checkForGetUserMedia = () => {
    const iOSVersion = parseFloat(osVersion);

    // navigator.mediaDevices.getUserMedia() is only supported on iOS > 11.0 and only on Safari (not Chrome, Firefox, etc.)
    if (iOSVersion >= parseFloat("11.0")) {
      if (!isSafari) {
        setUnsupportedIOSBrowser(true);
        setShowError(true);
      }
    }

    // If they're not on iOS 11, it doesn't matter what browser they're using, navigator.mediaDevices.getUserMedia() will return undefined
    else {
      setUnsupportedIOSVersion(true);
      setShowError(true);
    }
  };

  const onSelectYes = async () => {
    // If this was an iOS device, log the model to Google Analytics
    if (isIOS) {
      logiPhoneModel();
    }

    try {
      // Attempt to access device camera
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1920, height: 1080 },
      });

      // TODO - Log the permission grant time if it took more than 900 ms
      // const startTime = Date.now();
      // shouldLogPermissionGrantTime(startTime);

      // Navigate to the scan page
      history.push({ pathname: "/scan" });
    } catch (error) {
      setCameraAccessible(false);
      setShowError(true);
    }
  };

  const closeCameraErrorScreen = () => {
    // The user has seen that camera is not accessible, so essentially close the screen and reset camera access and them being at the Barnes
    setCameraAccessible(null);
    setUserAtBarnes(null);
    setShowError(false);
  };

  return (
    <div className="home-wrapper" id="home-wrapper" style={homeContainerStyle}>
      {/* Show the unsupported browser dialog if the browser is not supported */}
      {unsupportedIOSBrowser ? (
        <UnsupportedDialogue unsupportedIOSBrowser={true} />
      ) : null}

      {/* Show the unsupported iOS version dialog if the iOS version is not supported */}
      {unsupportedIOSVersion ? (
        <UnsupportedDialogue unsupportedIOSVersion={true} />
      ) : null}

      <img
        src={home_background}
        alt="home_background"
        style={{ width: screen.width, height: screen.height }}
      />

      {/* Only show the initial Welcome Screen prompt if they haven't selected any value for userAtBarnes */}
      {userAtBarnes == null && !showError && (
        <div className="landing-screen">
          {/* logo */}
          {isCentennial ? (
            <img
              src={barnes_100_logo}
              alt="barnes_logo"
              className="logo-center centennial-logo"
              role="img"
              aria-label="Welcome to the Barnes Focus Digital Guide"
            />
          ) : (
            <img
              src={barnes_logo}
              alt="barnes_logo"
              className="logo-center"
              role="img"
              aria-label="Welcome to the Barnes Focus Digital Guide"
            />
          )}
          <div className="user-loc-prompt">
            {getTranslation("Welcome_screen", "text_1")}{" "}
            <br aria-hidden={true} />
            {getTranslation("Welcome_screen", "text_2")}
          </div>
          <div className="home-action">
            <button className="action-btn" onClick={onSelectYes}>
              <span className="action-text h2">
                <Textfit mode="single" max={25}>
                  {getTranslation("Welcome_screen", "text_3")}
                </Textfit>
              </span>
            </button>
            <button
              className="action-btn"
              onClick={() => setUserAtBarnes(false)}
            >
              <span className="action-text h2">
                <Textfit mode="single" max={25}>
                  {getTranslation("Welcome_screen", "text_4")}
                </Textfit>
              </span>
            </button>
          </div>
          <div className="kf-banner">
            <img
              src={kf_logo}
              alt="knight_foundation_logo"
              className="kf-logo"
            />
            <div className="kf-text caption">
              {getTranslation("About", "text_2")}
            </div>
          </div>
        </div>
      )}

      {/* If the user has selected that they're not at the Barnes, show this section */}
      {userAtBarnes === false && (
        <div>
          <div className="app-usage-alert h2">
            <div className="app-usage-msg">
              <span>{getTranslation("Visit_soon", "text_1")}</span>
              <span> {getTranslation("Visit_soon", "text_2")}</span>
            </div>
            <div className="visit-online-link" style={visitOnlineLinkStyle}>
              <a
                href="https://www.barnesfoundation.org/"
                target="_blank"
                rel="noreferrer"
              >
                {getTranslation("Visit_soon", "text_3")}
              </a>
            </div>
          </div>
          <div className="btn-close" onClick={() => setUserAtBarnes(null)}>
            <img src={close_icon} alt="close" />
          </div>
        </div>
      )}

      {/* If the camera is not accessible */}
      {cameraAccessible === false && (
        <div>
          <div className="app-usage-alert h2">
            <div className="app-usage-msg">
              {isIOS && <span>{constants.GET_USER_MEDIA_ERROR_IOS}</span>}
              {isAndroid && (
                <span>{constants.GET_USER_MEDIA_ERROR_ANDROID}</span>
              )}
            </div>
          </div>
          <div className="btn-close" onClick={closeCameraErrorScreen}>
            <img src={close_icon} alt="close" />
          </div>
        </div>
      )}
    </div>
  );
};

export const Home = withTranslation(HomeComponent);
