import "express-session";

declare module "express-session" {
  interface SessionData {
    initialized: boolean;
    user_scanned_history: any[];
    lang_pref: string | null;
  }
}
