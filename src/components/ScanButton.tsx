import React from "react";
import scan_button from "../images/scan-button.svg";

// TODO: Fix types
type ScanButtonProps = {
  history: any;
  float: any;
};

export const ScanButton: React.FC<ScanButtonProps> = ({ history, float }) => {
  const handleScan = () => history.push({ pathname: "/scan" });

  return (
    <div className="scan-wrapper">
      <div
        id="camera-btn"
        className={`scan-button ${float ? "floating" : ""}`}
        onClick={handleScan}
        role="button"
        aria-roledescription="camera button"
      >
        <img src={scan_button} alt="scan" aria-labelledby="camera-btn" />
      </div>
    </div>
  )
}