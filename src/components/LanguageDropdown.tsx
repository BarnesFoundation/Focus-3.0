import React, { useState } from "react";
import check from "../images/check.svg";
import down_gray from "../images/down_gray_1x.png";
import down_white from "../images/down_wht_1x.png";
import up_gray from "../images/up_gray_1x.png";
import up_white from "../images/up_wht_1x.png";
import { LanguageOptionType, WithTranslationState } from "./withTranslation";

const DROP_UP = "UP";
const DROP_DOWN = "DOWN";

type LanguageDropdownProps = {
  onSelectLanguage: (item: LanguageOptionType) => void;
  isStoryItemDropDown?: boolean;
  selected: LanguageOptionType;
  langOptions: WithTranslationState["langOptions"];
};

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  onSelectLanguage,
  isStoryItemDropDown,
  selected,
  langOptions,
}) => {
  const [listVisible, setListVisible] = useState(false);

  const selectItem = (item) => {
    onSelectLanguage(item);
    setListVisible(false);
  };

  const getDropdownIcon = (dir) => {
    if (isStoryItemDropDown) {
      return dir === DROP_UP ? up_white : down_white;
    } else {
      return dir === DROP_UP ? up_gray : down_gray;
    }
  };

  const getDropdownText = (selected) => {
    return isStoryItemDropDown ? selected.code : selected.name;
  };

  return (
    <div className="dd-wrapper">
      <div
        className="dd-header"
        aria-haspopup="true"
        id="language-btn"
        onClick={() => setListVisible(!listVisible)}
      >
        <div className="dd-header-title" aria-labelledby="language-btn">
          {getDropdownText(selected)}
        </div>
        {listVisible ? (
          <span>
            <img
              src={getDropdownIcon(DROP_UP)}
              aria-hidden={true}
              aria-label="Up"
            />
          </span>
        ) : (
          <span>
            <img
              src={getDropdownIcon(DROP_DOWN)}
              aria-hidden={true}
              aria-label="Down"
            />
          </span>
        )}
      </div>
      {listVisible && (
        <ul className="dd-list">
          {langOptions.map((item) => (
            <li
              className="dd-list-item"
              key={item.code}
              onClick={() => selectItem(item)}
            >
              <span className="language-select-s">{item.name}</span>
              {item.selected && (
                <img
                  src={check}
                  alt="Gray checkmark indicating currently selected language"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
