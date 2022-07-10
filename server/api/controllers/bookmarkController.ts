import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

class BookmarkController {
  public static setLanguagePreference(
    request: express.Request,
    response: express.Response
  ) {
    const languageToSet = request.body.language;

    if (!languageToSet) {
      return response.status(422).json({
        data: { errors: ["Language cannot be blank"] },
        message: "unprocessible_entity",
      });
    }

    // We need to update all bookmark entries for the user to use the new language
    // Bookmark.where( session_id: session.id ).update_all( language: language )

    // Update the language for the user
    request.session.lang_pref = languageToSet.toLowerCase();

    return response
      .status(200)
      .json({ data: { errors: [] }, message: "created" });
  }

  public static async submitEmail(
    request: express.Request,
    response: express.Response
  ) {
    const email = request.body.email;
    const sessionId = request.sessionID as any;

    // When we receive the email from the user
    // let's update all bookmarks taken during their session
    // to set their email for those bookmarks
    // TODO - this call will fail since the `sessionId` is a string
    // but Prisma expects `session_id` to be an auto-incremented integer
    if (email) {
      await prisma.bookmarks.updateMany({
        where: {
          session_id: sessionId,
        },
        data: {
          email: email,
        },
      });

      return response.status(200).json({
        data: { errors: [] },
        message: "Saved the email provided",
      });
    }

    return response.status(422).json({
      data: { errors: ["Email can't be blank"] },
      message: "",
    });
  }
}

export default BookmarkController;
