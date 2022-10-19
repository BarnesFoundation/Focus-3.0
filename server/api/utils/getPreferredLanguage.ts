import express from "express";

/** Gets the preferred language from the request and sets in session storage if it has changed
 * @param {express.Request} request The express request
 * @returns {string} The language code for the preferred language in lower case
 */
export const getPreferredLanguage = (request: express.Request): string => {
  // The preferred language should come from the args, the session, or finally, default to "en"
  const preferredLanguage = request.query.lang
    ? request.query.lang.toString().toLowerCase()
    : request.session.lang_pref
    ? request.session.lang_pref
    : "en";

  // If lang preference has changed, update session
  if (request.session.lang_pref !== preferredLanguage) {
    request.session.lang_pref = preferredLanguage;
  }

  return preferredLanguage;
};
