import React, { useContext } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import { TranslationContext } from "../contexts/TranslationContext";
import scan_button from "../images/scan-button.svg";

type NoMatchOverlayProps = {
  displayOverlay: boolean;
  handleScan: () => void;
};

export const NoMatchOverlay: React.FC<NoMatchOverlayProps> = ({
  displayOverlay,
  handleScan,
}) => {
  const { getTranslation } = useContext(TranslationContext);

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
