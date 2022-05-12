import express from "express";

export const fieldName = "storablePhoto";

class ArtworkController {
  public static async getInformation(
    request: express.Request,
    response: express.Response
  ) {
    const artworkId = request.params.artworkId;

    response.status(200).json(`We received ${artworkId}`);
  }
}

export default ArtworkController;
