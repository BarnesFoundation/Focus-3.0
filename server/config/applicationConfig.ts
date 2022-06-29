import Config from "./environmentConfig";

/** Configuration for the application. This includes items like session configuration
 * datastore provider (like ElasticSearch or eMuseum, as an example), company name
 * and more settings that'll eventually change from tenant-to-tenant.
 *
 * Because these will vary between application instances, these will eventually
 * live in the database domain having to do with tenants and their configurations.
 */

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
