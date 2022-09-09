import React from "react";
import { SearchRequestService } from "../services/SearchRequestService";
import {
  SNAP_LANGUAGE_PREFERENCE,
  SNAP_LANGUAGE_TRANSLATION,
} from "../constants";
import { LanguageOptionType, WithTranslationState } from "../types";

const withTranslation = (WrappedComponent) => {
  return class WithTranslation extends React.Component<
    {},
    WithTranslationState
  > {
    sr: SearchRequestService;

    constructor(props) {
      super(props);

      this.sr = new SearchRequestService();
      this.state = {
        translations: null,
        loaded: false,
        getTranslation: this.getTranslation,
        updateTranslations: this.updateTranslations,
        langOptions: [
          { name: "English", code: "En", selected: true },
          { name: "Español", code: "Es", selected: false },
          { name: "Français", code: "Fr", selected: false },
          { name: "Deutsch", code: "De", selected: false },
          { name: "Italiano", code: "It", selected: false },
          { name: "русский", code: "Ru", selected: false },
          { name: "中文", code: "Zh", selected: false },
          { name: "日本語", code: "Ja", selected: false },
          { name: "한국어", code: "Ko", selected: false },
        ],
        getSelectedLanguage: this.getSelectedLanguage,
        updateSelectedLanguage: this.updateSelectedLanguage,
      };
    }

    async componentWillMount() {
      console.log(
        "WithTranslation >> componentWillMount. Load the translations here"
      );
      // check local store for existing language preference and then save it if found
      const langPref = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE);
      langPref && (await this.sr.saveLanguagePreference(langPref));
      // Set translations in state
      const translations = await this.sr.getAppTranslations();
      this.setState({ translations: translations, loaded: true });
      localStorage.setItem(
        SNAP_LANGUAGE_TRANSLATION,
        JSON.stringify(translations)
      );
    }

    updateTranslations = async (): Promise<void> => {
      console.log(
        "WithTranslation >> updateTranslations. Update translations."
      );
      const translations = await this.sr.getAppTranslations();
      this.setState({ translations: translations, loaded: true });
      localStorage.setItem(
        SNAP_LANGUAGE_TRANSLATION,
        JSON.stringify(translations)
      );
    };

    getTranslation = (screen: string, textId: string): string => {
      return (
        this.state.translations[screen][textId].translated_content ||
        this.state.translations[screen][textId].screen_text
      );
    };

    getSelectedLanguage = async (): Promise<LanguageOptionType[]> => {
      const selectedLangCode = localStorage.getItem(SNAP_LANGUAGE_PREFERENCE);
      if (selectedLangCode !== null) {
        this.state.langOptions.map((option) => {
          if (option.code === selectedLangCode) {
            option.selected = true;
          } else {
            option.selected = false;
          }
        });
      }
      return this.state.langOptions.filter((lang) => lang.selected === true);
    };

    updateSelectedLanguage = async (
      lang: LanguageOptionType
    ): Promise<void> => {
      await this.state.langOptions.map(async (option) => {
        if (option.code === lang.code) {
          option.selected = true;
          localStorage.setItem(SNAP_LANGUAGE_PREFERENCE, lang.code);
          await this.sr.saveLanguagePreference(lang.code);
          await this.updateTranslations();
        } else {
          option.selected = false;
        }
      });
    };

    render() {
      return (
        <div>
          {this.state.loaded && (
            <WrappedComponent
              {...this.props}
              getTranslation={this.getTranslation}
              updateTranslations={this.updateTranslations}
              getSelectedLanguage={this.getSelectedLanguage}
              updateSelectedLanguage={this.updateSelectedLanguage}
              langOptions={this.state.langOptions}
            />
          )}
        </div>
      );
    }
  };
};
export default withTranslation;
