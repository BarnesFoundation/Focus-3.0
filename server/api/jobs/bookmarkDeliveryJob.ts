import { PrismaClient, bookmarks, es_cached_records } from "@prisma/client";

import { groupBy } from "../utils";
import { MailService, MailTemplates, TranslateService } from "../services";

const prisma = new PrismaClient();

// When this bookmark delivery job runs, we will collect bookmarks for each
// email that occurred more than 3 hours ago
const LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS = 3;
const LATEST_BOOKMARK_ENTRY_THRESHOLD_MS =
  LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS * 3600 * 1000;

type DeliverableBookmarks = { [email: string]: bookmarks[] };
type CollectedArtworks = {
  [artworkId: string]: {
    id: string;
    image_id: number;
  } & es_cached_records["es_data"];
};

/** Job responsible for sending the email to Focus users containing all of the bookmarks
 * that were saved for them during their Focus
 */
class BookmarkDeliveryJob {
  public static async main() {
    const deliverableBookmarks =
      await BookmarkDeliveryJob.getDeliverableBookmarks();
    const distinctEmailAddressCount = Object.keys(deliverableBookmarks).length;

    console.log(
      `Identified ${distinctEmailAddressCount} email addresses that have bookmarks ready for delivery`
    );

    // We'll pre-fetch all of the artworks associated with these bookmarks
    // in one big batch, rather than pulling them individually from the database later
    const artworks = await BookmarkDeliveryJob.retrieveArtworksForBookmarks(
      deliverableBookmarks
    );

    for (const email in deliverableBookmarks) {
      const bookmarkSet = deliverableBookmarks[email];

      // Identify the preferred language for this user
      // and pull translations for them in that language
      const preferredLanguage = bookmarkSet[0].language?.toLowerCase() || "en";
      const translations = await TranslateService.retrieveStoredTranslations(
        preferredLanguage
      );

      // Get the artworks needed for this email's set of bookmarks
      const bookmarkArtworkList = Object.values(
        bookmarkSet.reduce<CollectedArtworks>((acc, bookmark) => {
          if (artworks[bookmark.image_id]) {
            acc[bookmark.image_id] = artworks[bookmark.image_id];
          }
          return acc;
        }, {})
      );

      await MailService.send({
        to: email,
        template: "BookmarkEmail",
        locals: {
          translations,
          els_arr: bookmarkArtworkList,
        },
      });

      // We'll update these bookmarks in the database to indicate the email for
      // these bookmarks have now been processed and sent out to the user
      const mailedBookmarkIds = bookmarkSet.map((bookmark) => bookmark.id);
      await prisma.bookmarks.updateMany({
        where: {
          id: {
            in: mailedBookmarkIds,
          },
          email,
        },
        data: {
          mail_sent: true,
          updated_at: new Date(Date.now()).toISOString(),
        },
      });
    }

    console.log(
      `Completed delivery of bookmark emails for ${distinctEmailAddressCount} email addresses`
    );
  }

  /**
   * Identifies and returns the most recent bookmarks that should be delivered
   *
   * Bookmarks that are ready for delivery must meet this criteria
   * 1. Email for the bookmark must be defined and non-empty
   * 2. The email for that bookmark must not have been sent already
   * 3. The latest bookmark for the user must have occurred more than 3
   * hours ago (which would indicate the user has likely finished their Focus session)
   */
  private static async getDeliverableBookmarks(): Promise<DeliverableBookmarks> {
    const bookmarkThresholdAgo =
      Date.now() - LATEST_BOOKMARK_ENTRY_THRESHOLD_MS;

    const recentBookmarks = await prisma.bookmarks.findMany({
      where: {
        NOT: [{ email: undefined }, { email: "" }],
        mail_sent: false,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const bookmarksGroupedByEmail = groupBy(recentBookmarks, "email");
    const distinctEmailList = Object.keys(bookmarksGroupedByEmail);

    // We'll identify bookmark sets that should be mailed out
    const identifiedDeliverableBookmarks =
      distinctEmailList.reduce<DeliverableBookmarks>((acc, email) => {
        const bookmarkSet = bookmarksGroupedByEmail[email];
        const latestBookmarkEntry = bookmarkSet[0];

        // If the latest bookmark was created more than 3 hours ago
        // then it's an applicable set of bookmarks we want to deliver in this job run
        if (latestBookmarkEntry.created_at.getTime() < bookmarkThresholdAgo) {
          acc[email] = bookmarkSet;
        }
        return acc;
      }, {});

    return identifiedDeliverableBookmarks;
  }

  /** Fetches the artworks information from the database that are
   * are associated with these bookmark entries
   */
  private static async retrieveArtworksForBookmarks(
    deliverableBookmarks: DeliverableBookmarks
  ) {
    const distinctArtworkIds = Object.values(deliverableBookmarks)
      .flat()
      .reduce((acc: string[], deliverableBookmark) => {
        const bookmarkArtworkId = deliverableBookmark.image_id;

        // Only add this artwork id if we haven't already stored it
        if (acc.includes(bookmarkArtworkId) === false) {
          acc.push(bookmarkArtworkId);
        }

        return acc;
      }, []);

    // Pull all of these artworks from the database
    const artworks = await prisma.es_cached_records.findMany({
      where: {
        image_id: {
          in: distinctArtworkIds,
        },
      },
    });

    // Convert the artworks to a hash list for easier artwork picking
    const artworkHash = artworks.reduce<CollectedArtworks>((acc, artwork) => {
      const spreadArtwork = {
        id: artwork.id,
        image_id: artwork.image_id,
        // TODO - es_data is always an object in the Prisma definition
        // it needs to be converted from JSONValue to object type
        // @ts-ignore
        ...artwork.es_data,
      };
      acc[artwork.image_id] = spreadArtwork;
      return acc;
    }, {});

    return artworkHash;
  }
}

export default BookmarkDeliveryJob;
