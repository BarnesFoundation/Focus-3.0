import ElasticSearchService from "./elasticSearchService";
import ArtworkService, { ParsedRelatedStory } from "./artworkService";
import GraphCMSService, { RelatedStory, ObjectID } from "./graphCMSService";
import TranslateService from "./translateService";
import BookmarkService from "./bookmarkService";
import MailService, { Templates as MailTemplates } from "./mailService";
import DatabaseService from "./databaseService";

export {
  ElasticSearchService,
  ArtworkService,
  GraphCMSService,
  TranslateService,
  BookmarkService,
  MailService,
  DatabaseService,

  // Types related to services
  MailTemplates,
  ParsedRelatedStory,
  RelatedStory,
  ObjectID,
};
