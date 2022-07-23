import sessions from "express-session";
import connectPgSimple from "connect-pg-simple";

import Config, { EnvironmentStages, applicationConfiguration } from "../config";

const SESSION_STORE_TABLE_NAME = "user_sessions";

const PgSession = connectPgSimple(sessions);

export const Store = new PgSession({
  tableName: SESSION_STORE_TABLE_NAME,
  createTableIfMissing: true,

  // We don't expired sessions to be pruned automatically
  // at least for now. We'll do this manually
  pruneSessionInterval: false,
});

export const ApplicationSessions = sessions({
  store: Store,
  secret: applicationConfiguration.session.secret,
  resave: false,
  saveUninitialized: true,

  name: applicationConfiguration.session.cookieName,
  cookie: {
    maxAge: applicationConfiguration.session.maxAgeHours * 60 * 60 * 1000,

    // Only use secure cookies when running in production or development
    // as HTTPS is neccessary and is not available in local environment
    secure:
      Config.nodeEnv === EnvironmentStages.DEVELOPMENT ||
      Config.nodeEnv === EnvironmentStages.PRODUCTION,
  },
});
