import React, { createContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
  const { getTranslations } = useLocalStorage();
  const translations = getTranslations();

  const getTranslation = (screen: string, textId: string): string => {
    return (
      translations[screen][textId].translated_content ||
      translations[screen][textId].screen_text
    );
  };

  const providerValue: TranslationContextType = {
    translations,
    getTranslation,
  };

  return (
    <TranslationContext.Provider value={providerValue}>
      {children}
    </TranslationContext.Provider>
  );
};
