import React from "react";
import { LanguageDropdown } from "./LanguageDropdown";

// TODO: finish adding types as we refactor parent components
type StoryTitleProps = {
  langOptions;
  selectedLanguage;
  onSelectLanguage: (args?: any) => void;
};

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
