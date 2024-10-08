import {
  SNAP_LAST_TIMESTAMP,
  SNAP_APP_RESET_INTERVAL,
  SNAP_LANGUAGE_PREFERENCE,
  SNAP_USER_EMAIL,
  SNAP_ATTEMPTS,
} from "../constants";

/* Reset application if lastSnapTimestamp is more than 24 hours */
export const resetApplication = () => {
  // Get last snap timestamp from local storage
  const lastSnapTimestamp = parseInt(localStorage.getItem(SNAP_LAST_TIMESTAMP));

  if (lastSnapTimestamp) {
    // Check if the last snap timestamp was more than the interval time ago
    const ttl = lastSnapTimestamp + SNAP_APP_RESET_INTERVAL - Date.now();

    // Reset the application if so
    if (ttl <= 0) {
      localStorage.setItem(SNAP_LAST_TIMESTAMP, Date.now().toString());

      localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
      localStorage.removeItem(SNAP_USER_EMAIL);
      localStorage.removeItem(SNAP_ATTEMPTS);
    }
  }
};
