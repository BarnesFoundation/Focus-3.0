import React, { Component } from "react";
import { Match } from "react-router-dom";
import landscape_bg from "../images/barnes-landscape-background.png";
import { isIOS, isSafari } from "react-device-detect";
import {
  UNSUPPORTED_ORIENTATION_ALERT_MESSAGE,
  SNAP_LANGUAGE_TRANSLATION,
} from "../constants";
import { HOME, SCAN, ARTWORK } from "../constants/routes";

type WithOrientationProps = {
  match: Match;
};

type WithOrientationState = {
  orientationSupported: boolean;
};

const withOrientation = (WrappedComponent) =>
  class WithOrientation extends Component<
    WithOrientationProps,
    WithOrientationState
  > {
    translations;

    constructor(props) {
      super(props);

      this.state = {
        orientationSupported: true,
      };

      let translations = null;
      try {
        translations = JSON.parse(
          localStorage.getItem(SNAP_LANGUAGE_TRANSLATION)
        );
      } catch (error) {
        console.log("Error while parsing translation json.");
      }
      this.translations = translations;
    }

    componentDidMount() {
      if ("orientation" in screen) {
        screen.orientation.addEventListener("change", (e) => {
          console.log("current orientation :: " + screen.orientation.type);
          if (screen.orientation.type !== "portrait-primary") {
            this.setState({ orientationSupported: false });
          } else {
            this.setState({ orientationSupported: true });
          }
        });
      } else {
        console.log("Orientation API not supported");
        document.addEventListener("orientationchange", (e) => {
          switch (window.orientation) {
            case -90:
            case 90:
              /* Device is in landscape mode */
              this.setState({ orientationSupported: false });
              break;
            default:
              /* Device is in portrait mode */
              this.setState({ orientationSupported: true });
          }
        });
      }
    }

    render() {
      const width = isIOS && isSafari ? screen.height : screen.width;
      const height = isIOS && isSafari ? screen.width : screen.height;

      return (
        <div>
          {this.state.orientationSupported && (
            <WrappedComponent {...this.props} />
          )}

          {!this.state.orientationSupported && this.props.match.url === HOME && (
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
                  {this.translations
                    ? this.translations["Orientation_Error_Screen"]["text_1"]
                        .translated_content
                    : UNSUPPORTED_ORIENTATION_ALERT_MESSAGE}
                </div>
              </div>
            </div>
          )}

          {!this.state.orientationSupported &&
            (this.props.match.url.indexOf(ARTWORK) > -1 ||
              this.props.match.url === SCAN) && (
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
                    {this.translations
                      ? this.translations["Orientation_Error_Screen"]["text_1"]
                          .translated_content
                      : UNSUPPORTED_ORIENTATION_ALERT_MESSAGE}
                  </div>
                </div>
                <div className="landscape-wrapper">
                  <WrappedComponent {...this.props} />
                </div>
              </div>
            )}
        </div>
      );
    }
  };

export default withOrientation;
