import React, { createContext, useEffect, useState } from "react";
import { SNAP_LANGUAGE_TRANSLATION } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SearchRequestService } from "../services/SearchRequestService";

type TranslationContextType = {
  translations: object;
  getTranslation: (screen: string, textId: string) => string;
};

export const TranslationContext = createContext<TranslationContextType>({
  translations: null,
  getTranslation: null,
});

export const TranslationContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getTranslations, setLocalStorage } = useLocalStorage();
  const [translations, setTranslations] = useState(getTranslations());
  const [loaded, setLoaded] = useState(false);
  const sr = new SearchRequestService();

  const getTranslation = (screen: string, textId: string): string => {
    return (
      translations[screen][textId].translated_content ||
      translations[screen][textId].screen_text
    );
  };

  const updateTranslations = async () => {
    try {
      setLoaded(false);
      const tempTranslations = await sr.getAppTranslations();
      setTranslations(tempTranslations)
      setLocalStorage(SNAP_LANGUAGE_TRANSLATION, tempTranslations);
    } catch (e) {
      console.log("Error fetching translations:", e);
      throw e;
    } finally {
      setLoaded(true);
    }
  };

  const providerValue: TranslationContextType = {
    translations,
    getTranslation,
  };

  useEffect(() => {
    updateTranslations();
  }, []);

  return (
    loaded && (
      <TranslationContext.Provider value={providerValue}>
        {children}
      </TranslationContext.Provider>
    )
  );
};
