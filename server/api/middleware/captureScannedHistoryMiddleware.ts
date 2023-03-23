import express from "express";

import { DatabaseService } from "../services";

const prisma = DatabaseService.instance;

export const captureScannedHistoryMiddleware = async (
  request: express.Request,
  _: express.Response,
  next: express.NextFunction
) => {
  if (request.session.initialized) {
    // Artwork id is passed for Barnes collection objects
    const artworkId = request.params.artworkId;
    // Object id is passed for special exhibition objects
    const objectId = request.params.objectId;
    const sessionId = request.sessionID;

    // Add the artwork id to the existing scanned history
    request.session.user_scanned_history.push(artworkId);

    // Check if this session has created a bookmark before
    // and if they have, attempt to get the email from there
    const bookmarkThatHasEmail = await prisma.bookmarks.findFirst({
      where: {
        session_id: sessionId,
        NOT: [{ email: undefined }],
      },
    });

    // Generate a new bookmark record for this artwork
    const now = new Date(Date.now()).toISOString();
    // Set email_sent as true for special exhibition objects because we do not want to include them in the bookmark email
    await prisma.bookmarks.create({
      data: {
        session_id: sessionId,
        image_id: objectId ? objectId : artworkId,
        created_at: now,
        updated_at: now,
        email: bookmarkThatHasEmail ? bookmarkThatHasEmail.email : undefined,
        language: request.session.lang_pref,
        mail_sent: objectId ? true : false,
      },
    });
  }
  next();
};
