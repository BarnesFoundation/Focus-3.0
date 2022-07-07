import "express-session";

export interface SessionObjectInterface {
  initialized: boolean;
  user_scanned_history: any[];
  lang_pref: null | string;
  blob: {};
}

declare module "express-session" {
  interface SessionData extends SessionObjectInterface {}
}
