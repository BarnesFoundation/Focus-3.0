import { mockClient } from "aws-sdk-client-mock";
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import TranslateService from "../../../api/services/translateService";

const translateClientMock = mockClient(TranslateClient);

beforeEach(() => {
  translateClientMock.reset();
});

describe("TranslateService", () => {
  describe("translate", () => {
    const originalText = "Hello world";

    it("should return the original text when targetLanguage is 'en'", async () => {
      expect(await TranslateService.translate(originalText, "en")).toEqual(
        originalText
      );
    });

    it("should return the original text when there is no target language", async () => {
      expect(await TranslateService.translate(originalText, null)).toEqual(
        originalText
      );
    });

    it("should return original text when original text is an empty string", async () => {
      expect(await TranslateService.translate("", "en")).toEqual("");
    });

    it("should return translated text when there is text and a target language", async () => {
      const mockTranslation = "Hello world -- translated";
      translateClientMock
        .on(TranslateTextCommand)
        .resolves({ TranslatedText: mockTranslation });
      expect(await TranslateService.translate(originalText, "es")).toEqual(
        mockTranslation
      );
    });

    it("should return original text when there is an error with AWS Translate Client", async () => {
      translateClientMock
      .on(TranslateTextCommand)
      .rejects(new Error("Oops!"));
    expect(await TranslateService.translate(originalText, "es")).toEqual(
      originalText
    );
    })
  });

  describe.skip("translateContent", () => {});
});
