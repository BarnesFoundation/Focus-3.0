import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import scan_button from "../images/scan-button.svg";
import { WithTranslationState } from "./withTranslation";
import withTranslation from "./withTranslation";

export type NoMatchOverlayProps = {
  displayOverlay: boolean;
  handleScan: () => void;
} & WithTranslationState;

export const NoMatchOverlayComponent: React.FC<NoMatchOverlayProps> = ({
  displayOverlay,
  handleScan,
  getTranslation,
}) => {
  return (
    <ReactCSSTransitionGroup
      transitionName="fade"
      transitionEnterTimeout={500}
      transitionLeaveTimeout={100}
    >
      {displayOverlay && (
        <div id="no-match-overlay" className="no-match-overlay">
          <div className="hint h2">
            <span style={{ whiteSpace: "pre-line" }}>
              {`${getTranslation("No_Result_page", "text_1")}
											${getTranslation("No_Result_page", "text_2")}
											${getTranslation("No_Result_page", "text_3")}`}
            </span>
          </div>
          <div
            className="scan-button"
            id="camera-btn"
            onClick={handleScan}
            style={{ position: "absolute", bottom: "37px" }}
            role="button"
            aria-roledescription="camera button"
          >
            <img src={scan_button} alt="scan" aria-labelledby="camera-btn" />
          </div>
        </div>
      )}
    </ReactCSSTransitionGroup>
  );
};

export const NoMatchOverlay = withTranslation<NoMatchOverlayProps>(
  NoMatchOverlayComponent
);
