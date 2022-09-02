import { SNAP_LANGUAGE_PREFERENCE } from "../components/Constants";

type SetLocalStorage = (key: string, value: any) => void;
type GetLocalStorage = (key: string) => any;

type UseLocalStorage = {
  setLocalStorage: SetLocalStorage;
  getLocalStorage: GetLocalStorage;
  getLanguagePreference: () => any;
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

// hook to use in components
export const useLocalStorage = (): UseLocalStorage => {
  return {
    setLocalStorage,
    getLocalStorage,
    getLanguagePreference,
  };
};
