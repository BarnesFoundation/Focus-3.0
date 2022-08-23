import ElasticSearchService from "./elasticSearchService";
import ArtworkService, { ParsedRelatedStory } from "./artworkService";
import GraphCMSService, { RelatedStory } from "./graphCMSService";
import TranslateService from "./translateService";
import BookmarkService from "./bookmarkService";
import MailService, { Templates as MailTemplates } from "./mailService";

export {
  ElasticSearchService,
  ArtworkService,
  GraphCMSService,
  RelatedStory,
  TranslateService,
  BookmarkService,
  MailService,

  // Types related to services
  MailTemplates,
  ParsedRelatedStory,
};
