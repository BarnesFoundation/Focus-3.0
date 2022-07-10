import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const captureScannedHistoryMiddleware = async (
  request: express.Request,
  _: express.Response,
  next: express.NextFunction
) => {
  if (request.session.initialized) {
    const artworkId = request.params.artworkId;
    const sessionId = 123; // parseInt(request.sessionID);

    // Add the artwork id to the existing scanned history
    request.session.user_scanned_history.push(artworkId);

    // Check if this session has created a bookmark before
    // and if they have, attempt to get the email from there
    // TODO - `session_id` in the database is currently an auto-incremented integer
    // but the `sessionId` in `request.session` is a string and so we can't
    // search existing bookmarks with it nor create new bookmarks
    // We need to perform a migration to convert the `session_id` field from
    // auto-incremented integer into a text field
    // Commenting out the code below for now
    /* const bookmarkThatHasEmail = await prisma.bookmarks.findFirst({
      where: {
        session_id: sessionId,
        NOT: [{ email: undefined }],
      },
    });

    // Generate a new bookmark record for this artwork
    const now = new Date(Date.now()).toISOString();
    await prisma.bookmarks.create({
      data: {
        session_id: sessionId,
        image_id: artworkId,
        created_at: now,
        updated_at: now,
        email: bookmarkThatHasEmail ? bookmarkThatHasEmail.email : undefined,
        language: request.session.lang_pref,
      },
    }); */
  }
  next();
};
