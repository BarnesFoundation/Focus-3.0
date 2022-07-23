import { PrismaClient } from "@prisma/client";

import { ElasticSearchService } from "../services";

const prisma = new PrismaClient();

function groupBy<T>(list: Array<T>, identifier: string): Array<T> {
  const groupedResultList = list.reduce(function (acc, item) {
    acc[item[identifier]] = acc[item[identifier]] || [];
    acc[item[identifier]].push(item);
    return acc;
  }, Object.create(null));
  return groupedResultList;
}

class BookmarkDeliveryJob {
  /** Job responsible for sending the email to Focus users containing all of the bookmarks
   * that were saved for them during their Focus session
   */

  public static async main() {
    // Bookmarks that are ready for delivery must meet this criteria
    // 1. Email must be defined and non-empty
    // 2. The email for that bookmark must not have been sent already
    const deliverableBookmarks = await prisma.bookmarks.findMany({
      where: {
        NOT: [{ email: undefined }, { email: "" }],
        mail_sent: false,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    console.log(
      `Identified ${deliverableBookmarks.length} bookmarks ready for delivery`
    );

    if (deliverableBookmarks.length > 0) {
      const emailGroupedBookmarks = groupBy(deliverableBookmarks, "email");
    }
  }
}

export default BookmarkDeliveryJob;
