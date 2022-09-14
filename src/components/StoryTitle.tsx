import React from "react";
import { StoryTitleProps } from "../types/componentTypes";
import { LanguageDropdown } from "./LanguageDropdown";

export const StoryTitle: React.FC<StoryTitleProps> = ({
  langOptions,
  selectedLanguage,
  onSelectLanguage,
}) => {
  return (
    <div id="story-title-bar" className="story-title-bar">
      <div className="language-dropdown">
        <LanguageDropdown
          isStoryItemDropDown={true}
          langOptions={langOptions}
          selected={selectedLanguage}
          onSelectLanguage={onSelectLanguage}
        />
      </div>
    </div>
  );
};
