import Config from "./environmentConfig";

export default {
  session: {
    /** Name for the cookie to be set on the browser session */
    cookieName: "BarnesFocus",

    /** Maximum time session should persist on the browser */
    maxAgeHours: 8,

    saveUninitialized: true,

    /** Secret for signing the session */
    secret: Config.session.secret,
  },

  elasticSearch: {
    collection: "collection",
  },
};
