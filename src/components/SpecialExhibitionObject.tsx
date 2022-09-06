import React from "react";
import ProgressiveImage from "react-progressive-image";
import { useLocation } from "react-router-dom";

export const SpecialExhibitionObject: React.FC = () => {
  const location = useLocation();
  console.log("state:", location.state.result);

  return (
    <div>
      <ProgressiveImage
        src={location.state.result.referenceImageUrl}
        placeholder={location.state.result.referenceImageUrl}
      >
        {(src) => (
          <img
            src={src}
            alt="match_image"
            role="img"
          />
        )}
      </ProgressiveImage>
    </div>
  );
};
