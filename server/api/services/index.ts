import ElasticSearchService from "./elasticSearchService";
import ArtworkService, { ParsedRelatedStory } from "./artworkService";
import GraphCMSService, { RelatedStory, ObjectID } from "./graphCMSService";
import TranslateService from "./translateService";
import BookmarkService from "./bookmarkService";
import MailService, { Templates as MailTemplates } from "./mailService";

export {
  ElasticSearchService,
  ArtworkService,
  GraphCMSService,
  TranslateService,
  BookmarkService,
  MailService,

  // Types related to services
  MailTemplates,
  ParsedRelatedStory,
  RelatedStory,
  ObjectID,
};
