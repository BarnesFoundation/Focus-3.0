import { PrismaClient, bookmarks } from "@prisma/client";

import { groupBy, generateTimeAgo } from "../utils";
import {
  GraphCMSService,
  TranslateService,
  MailService,
  ParsedRelatedStory,
} from "../services";
import { isLocal } from "../../config";

const prisma = new PrismaClient();

// When this story delivery job runs, we will collect stories for each
// set of bookmarks that occurred more than 22 hours ago
const LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS = 22;

type DeliverableStoryBookmarks = { [email: string]: bookmarks[] };
type CollectedStories = {
  [storyBookmarkArtworkId: string]: ParsedRelatedStory;
};

type LanguageWithStory = {
  [languagePreference: string]: CollectedStories;
};

class StoryDeliveryJob {
  public static async main() {
    const deliverableStoryBookmarks =
      await StoryDeliveryJob.getDeliverableStoryBookmarks();
    const distinctEmailAddressCount = Object.keys(
      deliverableStoryBookmarks
    ).length;

    console.log(
      `Identified ${distinctEmailAddressCount} email addresses that have story bookmarks ready for delivery`
    );

    // We'll pre-fetch all of the stories associated with these bookmarks
    // in one big batch, rather than pulling them individually later
    const stories = await StoryDeliveryJob.retrieveStoriesForBookmarks(
      deliverableStoryBookmarks
    );

    for (const email in deliverableStoryBookmarks) {
      const bookmarkSet = deliverableStoryBookmarks[email];

      // Identify the preferred language for this user
      // and pull translations for them in that language
      const preferredLanguage = bookmarkSet[0].language?.toLowerCase() || "en";
      const translations = await TranslateService.retrieveStoredTranslations(
        preferredLanguage
      );

      // Get the artworks needed for this email's set of bookmarks
      const bookmarkStoryList = Object.values(
        bookmarkSet.reduce<CollectedStories>((acc, bookmark) => {
          if (stories[preferredLanguage][bookmark.image_id]) {
            acc[bookmark.image_id] =
              stories[preferredLanguage][bookmark.image_id];
          }
          return acc;
        }, {})
      );

      // We can use this session id to identify a user because it's listed in their bookmark records
      console.debug(
        `For session id ${bookmarkSet[0].session_id}, we will deliver the following story id's`,
        bookmarkStoryList.map((item) => item.unique_identifier)
      );
      await MailService.send({
        to: email,
        template: "StoryEmail",
        locals: {
          translations,
          stories: bookmarkStoryList,
          lang: preferredLanguage,
        },
      });

      // We'll update these bookmarks in the database to indicate the email for
      // these bookmarks have now been processed and sent out to the user
      const mailedStoryBookmarkIds = bookmarkSet.map((bookmark) => bookmark.id);
      await prisma.bookmarks.updateMany({
        where: {
          id: {
            in: mailedStoryBookmarkIds,
          },
          email,
        },
        data: {
          story_mail_sent: true,
          updated_at: new Date(Date.now()).toISOString(),
        },
      });
    }

    console.log(
      `Completed delivery of story emails for ${distinctEmailAddressCount} email addresses`
    );
  }

  /** Determines story bookmarks that should be emailed as part of this job run
   * The bookmarks that are emailed as part of this job run must meet this criteria
   * 1. The latest bookmark entry must have been created at a time less than or equal to our
   *    `LATEST_BOOKMARK_ENTRY_THRESHOLD` value ago
   * 2. The bookmarks must have a `story_read` value of true
   * 3. The `email` field for the bookmarks must be non-null
   */
  private static async getDeliverableStoryBookmarks() {
    // When we're running locally, we're typically running the job immediately
    // via POSTing the endpoint or manually executing this file
    // So, in a local environment only, we'll override the threshold
    // to identify all records up through the present moment
    // rather than the delay threshold used in Production/Development
    const storyBookmarkThresholdAgo = isLocal
      ? Date.now()
      : generateTimeAgo(LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS);

    const recentStoryBookmarks = await prisma.bookmarks.findMany({
      where: {
        NOT: [{ email: undefined }, { email: "" }],
        story_mail_sent: false,
        story_read: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const storyBookmarksGroupedByEmail = groupBy(recentStoryBookmarks, "email");
    const distinctEmailList = Object.keys(storyBookmarksGroupedByEmail);

    // We'll identify story sets that should be mailed out
    const identifiedDeliverableStoryBookmarks =
      distinctEmailList.reduce<DeliverableStoryBookmarks>((acc, email) => {
        const storyBookmarkSet = storyBookmarksGroupedByEmail[email];
        const latestBookmarkEntry = storyBookmarkSet[0];

        // If the latest story bookmark was created more than [X] hours ago
        // then it's an applicable set of story bookmarks we want to deliver in this job run
        if (
          latestBookmarkEntry.created_at.getTime() < storyBookmarkThresholdAgo
        ) {
          acc[email] = storyBookmarkSet;
        }
        return acc;
      }, {});

    return identifiedDeliverableStoryBookmarks;
  }

  /** This function helps prevent making a redundant amount of external calls
   * to retrieve the stories associated with our bookmarks, since
   * to retrieve stories properly, we need to
   * 1. Reach out to the GraphCMS API to retrieve the content
   * 2. Translate the fetched story content to the language as indicated by the bookmarks
   *
   * In order to prevent redundant calls, we do the following
   * 1. Create a hash map of the languages these set of bookmarks require, such as `{ 'fr': { ... }, 'es': { ... } }`
   * 2. Within each of these keys, we added a key, where that key is the artwork ID for an artwork needed for the bookmark
   *    such as `{ 'fr': { [5198]: ... }, 'es': { [6726]: .... } }`
   * 3. Within each of the keys of these artwork IDs, we store the fetched translated story content
   *
   * With this logic above, we prevent reaching out to GraphCMS more than once for a story content
   * and prevent reaching out to AWS Translate to translate the same story content more than once
   */
  private static async retrieveStoriesForBookmarks(
    deliverableStoryBookmarks: DeliverableStoryBookmarks
  ): Promise<LanguageWithStory> {
    const distinctStoryArtworksAndLanguages = await Object.values(
      deliverableStoryBookmarks
    )
      .flat()
      .reduce<Promise<LanguageWithStory>>(
        async (accPromise, deliverableStoryBookmark) => {
          const acc = await accPromise;
          const bookmarkArtworkId = deliverableStoryBookmark.image_id;
          const languagePreference = deliverableStoryBookmark.language;

          // Only add this language if we haven't already stored it
          if (!acc.hasOwnProperty(languagePreference)) {
            acc[languagePreference] = {};
          }

          // Store this story under the language preference needed for it
          if (!acc[languagePreference].hasOwnProperty(bookmarkArtworkId)) {
            const translatedStory = await GraphCMSService.findByObjectId(
              bookmarkArtworkId,
              languagePreference
            );

            acc[languagePreference] = {
              ...acc[languagePreference],
              [bookmarkArtworkId]: translatedStory,
            };
          }

          return acc;
        },
        Promise.resolve({}) as Promise<LanguageWithStory>
      );

    return distinctStoryArtworksAndLanguages;
  }
}

export default StoryDeliveryJob;
