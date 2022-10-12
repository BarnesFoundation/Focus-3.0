import { PrismaClient } from "@prisma/client";
import express from "express";
import * as EmailValidator from "email-validator";

import { BookmarkService } from "../services";

const prisma = new PrismaClient();

class BookmarkController {
  public static async setLanguagePreference(
    request: express.Request,
    response: express.Response
  ) {
    const languageToSet = request.body.language;
    const sessionId = request.sessionID;

    if (!languageToSet) {
      return response.status(422).json({
        data: { errors: ["Language cannot be blank"] },
        message: "unprocessible_entity",
      });
    }

    // Update the language for the user
    request.session.lang_pref = languageToSet.toLowerCase();
    await request.session.save();

    // We need to update all bookmark entries for the user to use the new language
    await prisma.bookmarks.updateMany({
      where: {
        session_id: sessionId,
      },
      data: {
        language: languageToSet.toLowerCase(),
      },
    });

    return response
      .status(200)
      .json({ data: { errors: [] }, message: "created" });
  }

  public static async submitEmail(
    request: express.Request,
    response: express.Response
  ) {
    const email = request.body.email;
    const newsletter = request.body;
    const sessionId = request.sessionID;

    // When we receive the email from the user
    // let's update all bookmarks taken during their session
    // to set their email for those bookmarks
    if (email) {
      let responseMessage = "Saved the email provided";
      await prisma.bookmarks.updateMany({
        where: {
          session_id: sessionId,
        },
        data: {
          email: email,
        },
      });

      // Subscribe the user to the newsletter if they opted-in
      if (newsletter) {
        await BookmarkService.subscribeUserNewsletter(email);
        responseMessage += " and subscribed email to newsletter";
      }

      return response.status(200).json({
        data: { errors: [], message: responseMessage },
      });
    }

    return response.status(422).json({
      data: { errors: ["Email can't be blank"] },
      message: "",
    });
  }

  public static async validateEmail(
    request: express.Request,
    response: express.Response
  ) {
    const email = request.body.email;
    const emailIsValid = EmailValidator.validate(email);

    return response.status(200).json(emailIsValid);
  }
}

export default BookmarkController;
