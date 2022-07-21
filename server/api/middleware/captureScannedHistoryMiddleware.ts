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
    await prisma.bookmarks.create({
      data: {
        session_id: sessionId,
        image_id: artworkId,
        created_at: now,
        updated_at: now,
        email: bookmarkThatHasEmail ? bookmarkThatHasEmail.email : undefined,
        language: request.session.lang_pref,
      },
    });
  }
  next();
};
