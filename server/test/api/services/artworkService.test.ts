import { mockClient } from "aws-sdk-client-mock";
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import ArtworkService from "../../../api/services/artworkService";

const translateClientMock = mockClient(TranslateClient);

beforeEach(() => {
  translateClientMock.reset();
});

describe("ArtworkService", () => {
  describe("getCmsContentTranslations", () => {
    it("should return original content when targetLanguage is 'en'", async () => {
      expect(
        await ArtworkService.getCmsContentTranslations(originalContent, "en")
      ).toEqual(originalContent);
    });

    it("should return the original content when there is no target language", async () => {
      expect(
        await ArtworkService.getCmsContentTranslations(originalContent, null)
      ).toEqual(originalContent);
    });

    it("should return original content when original content is an empty array", async () => {
      expect(await ArtworkService.getCmsContentTranslations([], "en")).toEqual([]);
    });

    it("should return translated content object when there is content array and a target langauge", async () => {
      const mockTranslation = "Hello world -- translated";
      translateClientMock
        .on(TranslateTextCommand)
        .resolves({ TranslatedText: mockTranslation });

      expect(
        await ArtworkService.getCmsContentTranslations(originalContent, "es")
      ).toEqual([
        {
          contentBlock: [
            {
              altText: null,
              caption: {
                html: "Hello world -- translated",
              },
              image: {
                url: "https://media.graphassets.com/ZPY9XetuQnydYm8sMG7z",
              },
              type: "Image",
            },
            {
              textBlock: {
                html: "Hello world -- translated",
              },
              type: "TextBlock",
            },
            {
              altText: null,
              caption: {
                html: "Hello world -- translated",
              },
              image: {
                url: "https://media.graphassets.com/WwHuHrQnTqC9e7M3aPdx",
              },
              type: "Image",
            },
          ],
        },
        {
          contentBlock: [
            {
              subtitle: null,
              title: "Hello world -- translated",
              type: "Title",
            },
            {
              textBlock: {
                html: "Hello world -- translated",
              },
              type: "TextBlock",
            },
            {
              leftImage: {
                altText: null,
                caption: {
                  html: "Hello world -- translated",
                },
                image: {
                  url: "https://media.graphassets.com/ZPY9XetuQnydYm8sMG7z",
                },
              },
              rightImage: {
                altText: null,
                caption: {
                  html: "Hello world -- translated",
                },
                image: {
                  url: "https://media.graphassets.com/qPexGujTdWbYJ178NdAP",
                },
              },
              type: "ImageComparison",
            },
            {
              subtitle: "Hello world -- translated",
              title: "Hello world -- translated",
              type: "Title",
            },
            {
              textBlock: {
                html: "Hello world -- translated",
              },
              type: "TextBlock",
            },
            {
              type: "Video",
              url: "www.example.com",
            },
          ],
        },
      ]);
    });

    it("should return original content when there is an error with AWS Translate Client", async () => {
      translateClientMock.on(TranslateTextCommand).rejects(new Error("Oops!"));

      expect(
        await ArtworkService.getCmsContentTranslations(originalContent, "es")
      ).toEqual(originalContent);
    });
  });
})


const originalContent = [
  {
    contentBlock: [
      {
        altText: null,
        caption: {
          html: "<p></p>",
        },
        image: {
          url: "https://media.graphassets.com/ZPY9XetuQnydYm8sMG7z",
        },
        type: "Image",
      },
      {
        type: "TextBlock",
        textBlock: {
          html: "<p>Lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
        },
      },
      {
        altText: null,
        caption: {
          html: "<p></p>",
        },
        image: {
          url: "https://media.graphassets.com/WwHuHrQnTqC9e7M3aPdx",
        },
        type: "Image",
      },
    ],
  },
  {
    contentBlock: [
      {
        type: "Title",
        subtitle: null,
        title: "New insights",
      },
      {
        type: "TextBlock",
        textBlock: {
          html: "<p>Lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
        },
      },
      {
        leftImage: {
          altText: null,
          caption: {
            html: "<p>Color version</p>",
          },
          image: {
            url: "https://media.graphassets.com/ZPY9XetuQnydYm8sMG7z",
          },
        },
        rightImage: {
          altText: null,
          caption: {
            html: "<p>Black and white version</p>",
          },
          image: {
            url: "https://media.graphassets.com/qPexGujTdWbYJ178NdAP",
          },
        },
        type: "ImageComparison",
      },
      {
        type: "Title",
        subtitle: "Subtitle",
        title: "New insights",
      },
      {
        type: "TextBlock",
        textBlock: {
          html: "<p>Lorem ipsum, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in<br>reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
        },
      },
      {
        type: "Video",
        url: "www.example.com",
      },
    ],
  },
];
