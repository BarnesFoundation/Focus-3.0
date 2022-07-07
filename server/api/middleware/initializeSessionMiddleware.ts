import express from "express";

import { isEmpty } from "../utils/isEmpty";
import { SessionObjectInterface } from "../types/sessionType";

const SUPPORTED_LANGUAGES = [
  "En",
  "Es",
  "Fr",
  "De",
  "It",
  "Ru",
  "Zh",
  "Ja",
  "Ko",
];

export const initializeSessionMiddlware = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  // This means the session has not yet been initialized
  if (!request.session.initialized) {
    const initializedSession = getInitializedSessionObject(request);
    request.session = Object.assign(request.session, initializedSession);
  }
  next();
};

const getInitializedSessionObject = (
  request: express.Request
): SessionObjectInterface => {
  const preferredLanguage = determinePreferredLanguage(request);

  return {
    initialized: true,
    user_scanned_history: [],
    lang_pref: preferredLanguage,
    blob: {},
  };
};

const determinePreferredLanguage = (
  request: express.Request
): string | null => {
  const acceptLanguageHeader = request.header["HTTP_ACCEPT_LANGUAGE"] as {
    locale: string;
  }[];

  if (acceptLanguageHeader && acceptLanguageHeader.length > 0) {
    // Modern browsers order language by preference, so first element would be the preferred language
    // and we'll strip the dash as we only accept the language code by itself
    const preferredLanguage = acceptLanguageHeader[0].locale as string;
    const dashEl = preferredLanguage.indexOf("-");

    const baseLanguageCode = preferredLanguage.slice(
      0,
      dashEl >= 0 ? dashEl - 1 : preferredLanguage.length
    );

    const determinedPreferredLanguage = SUPPORTED_LANGUAGES.find(
      (sl) => sl.toLowerCase() === baseLanguageCode.toLowerCase()
    );

    return determinedPreferredLanguage;
  }

  return null;
};
