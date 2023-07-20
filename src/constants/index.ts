/**
 * snap v2 constants
 * ===== START =====
 */
import { browserName } from "react-device-detect";

export const APP_VERSION = process.env.APP_VERSION;
export const UNSUPPORTED_ORIENTATION_ALERT_MESSAGE =
  "The digital guide is best viewed in Portrait mode.";
export const ART_WORK_INFO_URL = "/api/artwork/";
export const STORIES_URL = (artworkId: string) =>
  `/api/artwork/${artworkId}/stories`;
export const EXHIBITION_OBJECT_URL = (objectId: string) =>
  `/api/exhibition/${objectId}`;
export const STORIES_EMAIL_PAGE_URL = "/api/stories/";
export const STORIES_READ_URL = (artworkId: string, storyId: string) =>
  `/api/artwork/${artworkId}/stories/${storyId}/read`;
export const STORE_SEARCHED_RESULT_URL = "/api/scan/save";
export const SCAN_SEARCH_URL = "/api/scan/search";
export const SUBMIT_BOOKMARKS_EMAIL_URL = "/api/bookmark/submit";
export const SAVE_LANGUAGE_PREFERENCE_URL = "/api/bookmark/set-language";
export const APP_TRANSLATIONS_URL = "/api/translation";
export const VALIDATE_EMAIL_URL = "/api/bookmark/validate-email";
export const KNIGHT_FOUNDATION_CREDIT_TEXT =
  "Barnes Focus was created by the Knight Center for Digital Innovation in Audience Engagement at the Barnes.";
export const GET_USER_MEDIA_ERROR_IOS =
  "This app requires camera access. Go to Settings > " +
  browserName +
  " > and allow camera access, then refresh and try again.";
export const GET_USER_MEDIA_ERROR_ANDROID = `This app requires camera access. Go to \u22ee > Settings > Site Settings > Camera. Tap on "barnesfoc.us", then hit Reset and try again.`;
/**
 * snap v2 constants
 * ===== END =======
 */
export const SNAP_LANGUAGE_PREFERENCE = "barnes.snap.pref.lang";
export const SNAP_USER_EMAIL = "barnes.snap.pref.email";
export const SNAP_ATTEMPTS = "barnes.snap.pref.attempts";
export const SNAP_LANGUAGE_TRANSLATION = "barnes.snap.pref.lang.transl";

export const SOCIAL_MEDIA_FACEBOOK = "facebook";
export const SOCIAL_MEDIA_TWITTER = "twitter";
export const SOCIAL_MEDIA_GOOGLE = "google";
export const SOCIAL_MEDIA_INSTAGRAM = "instagram";

export const SNAP_LAST_TIMESTAMP = "barnes.snap.timestamp";
export const SNAP_COUNT_RESET_INTERVAL = 43200000;
export const SNAP_APP_RESET_INTERVAL = 86400000;

export const TOP_OFFSET = 504 / 563;
export const VIEWPORT_HEIGHT = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
);

export const REFRESH_INTERVAL = 250;
export const DEFAULT_DURATION = 800;
export const ARTWORK_OFFSET = 150;

export const LANGUAGE_EN = "En";

export const SCROLL_DIR = {
  DOWN: "DOWN",
  UP: "UP",
};

export const GA_EVENT_CATEGORY = {
  SNAP: "snap",
  SOCIAL: "social",
  CAMERA: "camera",
};

export const GA_EVENT_ACTION = {
  TAKE_PHOTO: "take_snap",
  SNAP_SUCCESS: "snap_success",
  SNAP_FAILURE: "snap_failure",
  BOOKMARK: "bookmark_art",
  SOCIAL_SHARE_NAVIGATOR: "share_navigator",
  SOCIAL_SHARE_FB: "share_fb",
  SOCIAL_SHARE_TWT: "share_twt",
  DEVICE_INFO: "device_info",
  SCAN: "scanner",
  CAMERA_PERMISSION: "camera_permission",
};

export const GA_EVENT_LABEL = {
  SNAP_BUTTON: "take a photo",
  SNAP_SUCCESS: "match found",
  SNAP_FAILURE: "match not found",
  BOOKMARK: "bookmark a work of art",
  SOCIAL_SHARE_NAVIGATOR: "android navigator share (multiple platforms)",
  SOCIAL_SHARE_FB: "ios share via facebook",
  SOCIAL_SHARE_TWT: "ios share via twitter",
  SCANNER_MOUNT_FAILURE: "scanner load failed",
  PERMISSION_GRANTED: "camera permission granted",
};

// Scrollmagic animation constants
export const INFO_CARD_DURATION = 700;
export const CONTENT_OFFSET = 67;
