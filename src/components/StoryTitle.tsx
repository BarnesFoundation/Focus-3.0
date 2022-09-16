import React from "react";
import { LanguageOptionType, WithTranslationState } from "./withTranslation";
import { LanguageDropdown } from "./LanguageDropdown";

export type StoryTitleProps = {
  langOptions: WithTranslationState["langOptions"];
  selectedLanguage: LanguageOptionType;
  onSelectLanguage: (item: LanguageOptionType) => void;
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
