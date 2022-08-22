import { PrismaClient, bookmarks } from "@prisma/client";

import { groupBy, batchify } from "../utils";
import {
  GraphCMSService,
  RelatedStory,
  TranslateService,
  MailService,
} from "../services";

const prisma = new PrismaClient();

// When this story delivery job runs, we will collect stories for each
// set of bookmarks that occurred more than 22 hours ago
const LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS = 0.017; // 22;
const LATEST_BOOKMARK_ENTRY_THRESHOLD_MS =
  LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS * 3600 * 1000;

type DeliverableStoryBookmarks = { [email: string]: bookmarks[] };
type CollectedStories = {
  [artworkId: string]: RelatedStory;
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
          if (stories[bookmark.image_id]) {
            acc[bookmark.image_id] = stories[bookmark.image_id];
          }
          return acc;
        }, {})
      );

      console.log(
        `For email ${email}, we will deliver the following story id's`,
        bookmarkStoryList.map((item) => item.id)
      );
      await MailService.send({
        to: email,
        template: "StoryEmail",
        locals: {
          translations,
          stories: bookmarkStoryList,
        },
      });

      // We'll update these bookmarks in the database to indicate the email for
      // these bookmarks have now been processed and sent out to the user
      const mailedStoryBookmarkIds = bookmarkSet.map((bookmark) => bookmark.id);
      /* await prisma.bookmarks.updateMany({
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
      }); */
    }

    console.log(
      `Completed delivery of story emails for ${distinctEmailAddressCount} email addresses`
    );
  }

  private static async getDeliverableStoryBookmarks() {
    const storyBookmarkThresholdAgo =
      Date.now() - LATEST_BOOKMARK_ENTRY_THRESHOLD_MS;

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

  /** Fetches the stpries information that are
   * are associated with these bookmark entries
   */
  private static async retrieveStoriesForBookmarks(
    deliverableStoryBookmarks: DeliverableStoryBookmarks
  ) {
    const distinctStoryArtworkIds = Object.values(deliverableStoryBookmarks)
      .flat()
      .reduce((acc: string[], deliverableStoryBookmark) => {
        const bookmarkArtworkId = deliverableStoryBookmark.image_id;

        // Only add this artwork id if we haven't already stored it
        if (acc.includes(bookmarkArtworkId) === false) {
          acc.push(bookmarkArtworkId);
        }

        return acc;
      }, []);

    // Pull all of these stories from the source
    const batchResponse = await batchify(
      distinctStoryArtworkIds,
      GraphCMSService.findByObjectId,
      8
    );
    const storiesForArtworks = batchResponse.flat();

    // Convert the artworks to a hash list for easier artwork picking
    const storyHash = storiesForArtworks.reduce<CollectedStories>(
      (acc, story, index) => {
        acc[distinctStoryArtworkIds[index]] = story;
        return acc;
      },
      {}
    );

    return storyHash;
  }
}

export default StoryDeliveryJob;
