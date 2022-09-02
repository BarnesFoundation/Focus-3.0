import React, { createContext, Fragment, useEffect, useState } from "react";
import { isIOS, isSafari } from "react-device-detect";
import { useLocation } from "react-router-dom";
import { UNSUPPORTED_ORIENTATION_ALERT_MESSAGE } from "../constants";
import * as ROUTES from "../constants/routes";

import { useLocalStorage } from "../hooks/useLocalStorage";
import landscape_bg from "../images/barnes-landscape-background.png";

type OrientationContextType = {
  orientationSupported: boolean;
}

export const OrientationContext = createContext<OrientationContextType>({
  orientationSupported: null,
});

export const OrientationContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [orientationSupported, setOrientationSupported] = useState(true);
  const { getTranslations } = useLocalStorage();
  const location = useLocation();
  const translations = getTranslations();
  const width = isIOS && isSafari ? screen.height : screen.width;
  const height = isIOS && isSafari ? screen.width : screen.height;

  const providerValues = {
    orientationSupported,
  };

  useEffect(() => {
    if ("orientation" in screen) {
      screen.orientation.addEventListener("change", (e) => {
        console.log("current orientation :: " + screen.orientation.type);
        if (screen.orientation.type !== "portrait-primary") {
          setOrientationSupported(false);
        } else {
          setOrientationSupported(true);
        }
      });
    } else {
      console.log("Orientation API not supported");
      document.addEventListener("orientationchange", (e) => {
        switch (window.orientation) {
          case -90:
          case 90:
            /* Device is in landscape mode */
            setOrientationSupported(false);
            break;
          default:
            /* Device is in portrait mode */
            setOrientationSupported(true);
        }
      });
    }
  }, []);

  return (
    <OrientationContext.Provider value={providerValues}>
      {/* If orientation is supported, render the child component */}
      {orientationSupported ? (
        children
      ) : (
        // Otherwise, render alert messages based on the current route
        <Fragment>
          {location.pathname === ROUTES.HOME && (
            <div className="home-wrapper" id="home-wrapper">
              <img
                src={landscape_bg}
                alt="landscape_bg"
                style={{ width: width, height: height }}
              />
              <div
                className="app-usage-alert"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="app-usage-msg h2">
                  {translations
                    ? translations["Orientation_Error_Screen"]["text_1"]
                      .translated_content
                    : UNSUPPORTED_ORIENTATION_ALERT_MESSAGE}
                </div>
              </div>
            </div>
          )}

          {(location.pathname.includes(ROUTES.ARTWORK) ||
            location.pathname === ROUTES.SCAN) && (
              <div>
                <div
                  className="app-usage-alert"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div className="app-usage-msg h2">
                    {translations
                      ? translations["Orientation_Error_Screen"]["text_1"]
                        .translated_content
                      : UNSUPPORTED_ORIENTATION_ALERT_MESSAGE}
                  </div>
                </div>
                <div className="landscape-wrapper">{children}</div>
              </div>
            )}
        </Fragment>
      )}
    </OrientationContext.Provider>
  );
};
