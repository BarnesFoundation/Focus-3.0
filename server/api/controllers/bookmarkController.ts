import express from "express";

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
    request.session.lang_pref = languageToSet;

    return response
      .status(200)
      .json({ data: { errors: [] }, message: "created" });
  }
}

export default BookmarkController;
