import {
  Prisma,
  PrismaClient,
  bookmarks,
  es_cached_records,
} from "@prisma/client";

import { groupBy } from "../utils";
import { MailService } from "../services";

import ReactDOMServer from "react-dom/server";

const prisma = new PrismaClient();

// When this bookmark delivery job runs, we will collect bookmarks for each
// email that occurred more than 3 hours ago
const LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS = 0.01666666666;
const LATEST_BOOKMARK_ENTRY_THRESHOLD_MS =
  LATEST_BOOKMARK_ENTRY_THRESHOLD_HOURS * 3600 * 1000;

type DeliverableBookmarks = { [email: string]: bookmarks[] };
type CollectedArtworks = { [artworkId: string]: es_cached_records };

class BookmarkDeliveryJob {
  /** Job responsible for sending the email to Focus users containing all of the bookmarks
   * that were saved for them during their Focus
   */

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
      const preferredLanguage = bookmarkSet[0].language?.toLowerCase() || "en";

      // Get the artworks needed for this email's set of bookmarks
      const bookmarkArtworkList = Object.values(
        bookmarkSet.reduce<CollectedArtworks>((acc, bookmark) => {
          if (artworks[bookmark.image_id]) {
            acc[bookmark.image_id] = artworks[bookmark.image_id];
          }
          return acc;
        }, {})
      );

      // TODO - implement the BookmarkNotifierMailer.send_activity_email method
      // from the Focus Ruby on Rails implementation. That logic involves
      // bringing in templating logic and the HTML for the email that's sent
      console.log(
        `For email ${email}, delivered the following artwork id's`,
        bookmarkArtworkList.map((item) => item.image_id)
      );
      await MailService.send({
        subject: "Your bookmarks at the Barnes",
        to: email,
        text: "",
        html: "",
      });
      /* BookmarkNotifierMailer.send_activity_email(mail, els_arr, language)
        .deliver_now; */

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
      acc[artwork.image_id] = artwork;
      return acc;
    }, {});

    return artworkHash;
  }
}

export default BookmarkDeliveryJob;
