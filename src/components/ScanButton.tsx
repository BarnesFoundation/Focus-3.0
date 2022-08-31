import React from "react";
import classnames from "classnames";
import { useHistory } from "react-router-dom";
import scan_button from "../images/scan-button.svg";

type ScanButtonProps = {
  float?: boolean;
};

export const ScanButton: React.FC<ScanButtonProps> = ({ float }) => {
  const history = useHistory();
  const handleScan = () => history.push({ pathname: "/scan" });

  return (
    <div className="scan-wrapper">
      <div
        id="camera-btn"
        className={classnames("scan-button", { floating: float })}
        onClick={handleScan}
        role="button"
        aria-roledescription="camera button"
      >
        <img src={scan_button} alt="scan" aria-labelledby="camera-btn" />
      </div>
    </div>
  )
}