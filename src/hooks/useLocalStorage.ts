import {
  SNAP_APP_RESET_INTERVAL,
  SNAP_ATTEMPTS,
  SNAP_LANGUAGE_PREFERENCE,
  SNAP_LANGUAGE_TRANSLATION,
  SNAP_LAST_TIMESTAMP,
  SNAP_USER_EMAIL,
} from "../constants";

type SetLocalStorage = (key: string, value: any) => void;
type GetLocalStorage = (key: string) => any;

type UseLocalStorage = {
  setLocalStorage: SetLocalStorage;
  getLocalStorage: GetLocalStorage;
  getLanguagePreference: () => any;
  getTranslations: () => object;
  getTranslation: (screen: string, textId: string) => string;
  resetLocalStorage: () => void;
};

/** Generic fn to store in localStorage by key
 * @param {string} key Name of the key to set in local storage
 * @param {string} val Value of the item to be stored
 */
const setLocalStorage: SetLocalStorage = (key, val) => {
  const value = typeof val === "string" ? val : JSON.stringify(val);
  localStorage.setItem(key, value);
};

/** Generic fn to fetch from localStorage by key
 * @param {string} key Name of the item to be fetched from local storage
 * @returns {any} Value of the item from local storage
 */
const getLocalStorage: GetLocalStorage = (key) => {
  const item = localStorage.getItem(key);

  try {
    return item && JSON.parse(item);
  } catch {
    return item;
  }
};

/**
 * @returns {any} Value of the users preferred language
 */
const getLanguagePreference = (): any => {
  return getLocalStorage(SNAP_LANGUAGE_PREFERENCE);
};

/**
 * @returns {object} JSON object of translation content
 */
const getTranslations = () => {
  return getLocalStorage(SNAP_LANGUAGE_TRANSLATION);
};

/** Returns translated content for UI content on pages
 * @param {string} screen
 * @param {string} textId
 * @returns {string} Translation of requested content
 */
const getTranslation = (screen: string, textId: string): string => {
  // TODO: use this fn inside FC components instead of passing the withTranslation version down through the parent/child props
  const translations = getTranslations();
  return (
    translations[screen][textId].translated_content ||
    translations[screen][textId].screen_text
  );
};

/**
 * @returns {void} Resets local storage to initial values
 */
const resetLocalStorage = (): void => {
  // Get last snap timestamp from local storage
  let lastSnapTimestamp = parseInt(getLocalStorage(SNAP_LAST_TIMESTAMP));

  if (lastSnapTimestamp) {
    // Check if the last snap timestamp was more than the interval time ago
    let ttl = lastSnapTimestamp + SNAP_APP_RESET_INTERVAL - Date.now();

    // Reset the application if so
    if (ttl <= 0) {
      setLocalStorage(SNAP_LAST_TIMESTAMP, Date.now());

      localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
      localStorage.removeItem(SNAP_USER_EMAIL);
      localStorage.removeItem(SNAP_ATTEMPTS);
    }
  }
};

// hook to use in components
export const useLocalStorage = (): UseLocalStorage => {
  return {
    setLocalStorage,
    getLocalStorage,
    getLanguagePreference,
    getTranslations,
    getTranslation,
    resetLocalStorage,
  };
};
