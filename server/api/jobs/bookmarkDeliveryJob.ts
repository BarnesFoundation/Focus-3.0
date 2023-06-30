import { bookmarks, es_cached_records } from "@prisma/client";

import { groupBy, generateTimeAgo } from "../utils";
import { MailService, TranslateService, DatabaseService } from "../services";
import { isLocal } from "../../config";
const prisma = DatabaseService.instance;

// When this bookmark delivery job runs, we will collect bookmarks for each
// email that occurred more than 3 hours ago
const LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS = 3;

const BOOKMARK_DELIVERY_LOG = `[BookmarkDeliveryJob]`;

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
      `${BOOKMARK_DELIVERY_LOG} Identified ${distinctEmailAddressCount} email addresses that have bookmarks ready for delivery`
    );

    // We'll pre-fetch all of the artworks associated with these bookmarks
    // in one big batch, rather than pulling them individually from the database later
    const artworksForBookmarks =
      await BookmarkDeliveryJob.retrieveArtworksForBookmarks(
        deliverableBookmarks
      );

    for (const email in deliverableBookmarks) {
      const bookmarkSet = deliverableBookmarks[email];
      const firstBookmark = bookmarkSet[0];
      const sessionId = firstBookmark.session_id;

      // Some possibly helpful debugging information
      // Get distinct artwork Image IDs that are used by the bookmarks
      const distinctArtworkListForBookmarks = bookmarkSet.reduce<Array<string>>(
        (distinctAcc, bookmark) => {
          if (distinctAcc.includes(bookmark.image_id) === false) {
            distinctAcc.push(bookmark.image_id);
          }

          return distinctAcc;
        },
        []
      );

      // Identify the preferred language for this user  and pull translations for them in that language
      const preferredLanguage = firstBookmark.language?.toLowerCase() || "en";
      const translations = await TranslateService.retrieveStoredTranslations(
        preferredLanguage
      );

      // Get the artworks needed for this email's set of bookmarks
      const artworkHashMap = bookmarkSet.reduce<CollectedArtworks>(
        (acc, bookmark) => {
          if (artworksForBookmarks[bookmark.image_id]) {
            acc[bookmark.image_id] = artworksForBookmarks[bookmark.image_id];
          }
          // The `artworksUsedInBookmarks` map should always have all of the artworks
          // needed by the bookmark. It is a problem if this is not the case, and we want to know
          else {
            console.warn(
              `${BOOKMARK_DELIVERY_LOG} Could not pull Artwork with Image ID ${bookmark.image_id} from the 'artworksForBookmarks' list for Session ID ${sessionId}`
            );
          }
          return acc;
        },
        {}
      );
      const bookmarkArtworkList = Object.values(artworkHashMap);

      // We can use this session id to identify a user because it's listed in their bookmark records
      // Log some help debugging information about the bookmarks and artworks sent. Distinct in this case
      // means unique bookmarks, ignoring bookmarks that are duplicates for the same artkwork
      console.debug(
        `${BOOKMARK_DELIVERY_LOG} For session id ${sessionId}, we identified ${distinctArtworkListForBookmarks.length} distinct bookmarks. We will deliver the following ${bookmarkArtworkList.length} artwork id's`,
        bookmarkArtworkList.map((item) => item.image_id)
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
      // This below query is updating all bookmarks for this session's bookmark set
      // even if somehow the needed artworks weren't collected for each and every bookmark
      // which may be related to the bug where email receivers are not receiving all of their
      // scanned artworks, even though our database marks all the bookmarks have been sent
      const mailedBookmarkIds = bookmarkSet.map((bookmark) => bookmark.id);
      const updatedAtNow = new Date(Date.now()).toISOString();
      await prisma.bookmarks.updateMany({
        where: {
          id: {
            in: mailedBookmarkIds,
          },
          email,
        },
        data: {
          mail_sent: true,
          updated_at: updatedAtNow,
        },
      });

      // If we have less artworks than needed by the bookmarks, it is a problem and will result in an email
      // that has less artworks than the user had captured
      if (bookmarkArtworkList.length < distinctArtworkListForBookmarks.length) {
        console.warn(
          `
		  ${BOOKMARK_DELIVERY_LOG}
		  For session ID ${sessionId}, we were only able to retrieve ${bookmarkArtworkList.length} of the ${distinctArtworkListForBookmarks.length} artworks used by the bookmarks for the session.
		  This will very likely result in discrepancies between the amount of artworks the user scanned, and the ones we send in
		  the email for the BookmarkDeliveryJob
		  `
        );
      }
    }

    console.log(
      `${BOOKMARK_DELIVERY_LOG} Completed delivery of bookmark emails for ${distinctEmailAddressCount} email addresses`
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
    // When we're running locally, we're typically running the job immediately
    // via POSTing the endpoint or manually executing this file
    // So, in a local environment only, we'll override the threshold
    // to identify all records up through the present moment
    // rather than the delay threshold used in Production/Development
    const bookmarkThresholdAgo = isLocal
      ? Date.now()
      : generateTimeAgo(LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS);

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
        if (latestBookmarkEntry.created_at.getTime() <= bookmarkThresholdAgo) {
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
