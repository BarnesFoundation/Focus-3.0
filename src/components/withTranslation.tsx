import React from "react";
import { SearchRequestService } from "../services/SearchRequestService";
import {
  SNAP_LANGUAGE_PREFERENCE,
  SNAP_LANGUAGE_TRANSLATION,
} from "../constants";

type English = { name: "English"; code: "En"; selected: boolean };
type Spanish = { name: "Español"; code: "Es"; selected: boolean };
type French = { name: "Français"; code: "Fr"; selected: boolean };
type German = { name: "Deutsch"; code: "De"; selected: boolean };
type Italian = { name: "Italiano"; code: "It"; selected: boolean };
type Russian = { name: "русский"; code: "Ru"; selected: boolean };
type Chinese = { name: "中文"; code: "Zh"; selected: boolean };
type Japanese = { name: "日本語"; code: "Ja"; selected: boolean };
type Korean = { name: "한국어"; code: "Ko"; selected: boolean };

export type LanguageOptionType =
  | English
  | Spanish
  | French
  | German
  | Italian
  | Russian
  | Chinese
  | Japanese
  | Korean;

export type WithTranslationState = {
  translations?;
  loaded?: boolean;
  getTranslation?: (screen: string, textId: string) => string;
  updateTranslations?: () => Promise<void>;
  langOptions?: LanguageOptionType[];
  getSelectedLanguage?: () => Promise<LanguageOptionType[]>;
  updateSelectedLanguage?: (language: LanguageOptionType) => Promise<void>;
};

function withTranslation<WrappedComponentProps>(WrappedComponent) {
  return class WithTranslation extends React.Component<
    WrappedComponentProps,
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
      if (langPref) await this.sr.saveLanguagePreference(langPref);
      // Set translations in state
      const translations = await this.sr.getAppTranslations(langPref);
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
      const selectedLang = await this.getSelectedLanguage();
      const translations = await this.sr.getAppTranslations(
        selectedLang[0].code
      );
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
}

export default withTranslation;
