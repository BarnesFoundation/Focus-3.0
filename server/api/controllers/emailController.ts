import express from "express";
import { DatabaseService, TranslateService } from "../services";
import { BookmarkDeliveryJob, StoryDeliveryJob } from "../jobs";
import { CollectedArtworks } from "api/jobs/bookmarkDeliveryJob";

const prisma = DatabaseService.instance;

class EmailController {
  public static async getBookmarkEmail(
    request: express.Request,
    response: express.Response
  ) {
    const sessionId = request.params.sessionId;

    const bookmarkSet = await prisma.bookmarks.findMany({
      where: {
        session_id: sessionId,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // We'll pre-fetch all of the artworks associated with these bookmarks
    // in one big batch, rather than pulling them individually from the database later
    const artworksForBookmarks =
      await BookmarkDeliveryJob.retrieveArtworksForBookmarks({
        [bookmarkSet[0].email]: bookmarkSet,
      });

    // Identify the preferred language for this user  and pull translations for them in that language
    const preferredLanguage = bookmarkSet[0].language?.toLowerCase() || "en";
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
            `[EmailController.getBookmarkEmail] Could not pull Artwork with Image ID ${bookmark.image_id} from the 'artworksForBookmarks' list for Session ID ${sessionId}`
          );
        }
        return acc;
      },
      {}
    );
    const bookmarkArtworkList = Object.values(artworkHashMap);

    return (
      response
        .status(200)
        // @ts-ignore
        .json({ bookmarkArtworkList, translations: translations.Email })
    );
  }

  public static async getStoryEmail(
    request: express.Request,
    response: express.Response
  ) {
    const sessionId = request.params.sessionId;

    const bookmarkSet = await prisma.bookmarks.findMany({
      where: {
        session_id: sessionId,
        story_read: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // We'll pre-fetch all of the stories associated with these bookmarks
    // in one big batch, rather than pulling them individually later
    const stories = await StoryDeliveryJob.retrieveStoriesForBookmarks({
      [bookmarkSet[0].email]: bookmarkSet,
    });

    // Identify the preferred language for this user  and pull translations for them in that language
    const preferredLanguage = bookmarkSet[0].language?.toLowerCase() || "en";
    const translations = await TranslateService.retrieveStoredTranslations(
      preferredLanguage
    );

    // Get the artworks needed for this email's set of bookmarks
    const bookmarkStoryList = Object.values(
      bookmarkSet.reduce((acc, bookmark) => {
        if (stories[preferredLanguage][bookmark.image_id]) {
          acc[bookmark.image_id] =
            stories[preferredLanguage][bookmark.image_id];
        }
        return acc;
      }, {})
    );

    return response.status(200).json({
      bookmarkStoryList,
      // @ts-ignore
      translations: translations.Email,
      preferredLanguage,
    });
  }
}

export default EmailController;
