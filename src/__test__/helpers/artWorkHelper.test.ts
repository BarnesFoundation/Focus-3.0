import { constructStory } from "../../helpers/artWorkHelper";
import { StoryItemsResponse } from "../../types/payloadTypes";

describe("Artwork Helpers", () => {
  describe("constructStory", () => {
    it("should return story data when given at least one story", () => {
      const content = storyInfo.data.content;
      expect(constructStory(storyInfo)).toEqual({
        stories: content.stories,
        storyTitle: content.story_title,
        storyId: storyInfo.data.unique_identifier,
      });
    });

    it("should return no data when given at least no stories", () => {
      expect(
        constructStory({ data: { total: 0 } } as StoryItemsResponse)
      ).toEqual({ stories: [], storyId: undefined, storyTitle: undefined });
    });
  });
});

const storyInfo: StoryItemsResponse = {
  data: {
    content: {
      story_title: "Why so many Renoirs?",
      original_story_title: "Why so many Renoirs?",
      stories: [
        {
          image_id: "5211",
          short_paragraph: {
            html: "<p>Between 1912 and 1951, Albert C. Barnes amassed an astonishing 181 works by Pierre- Auguste Renoir. It is the largest collection in the world.</p>",
          },
          long_paragraph: {
            html: "<p>Between 1912 and 1951, Albert C. Barnes amassed an astonishing 181 works by Pierre- Auguste Renoir. It is the largest collection in the world.</p>",
          },
          detail: {
            id: 5211,
            room: "Room 13",
            invno: "BF901",
            title: "Bathers in the Forest (Baigneuses dans la forêt)",
            medium: "Oil on canvas",
            people: "Pierre-Auguste Renoir",
            culture: "",
            birthDate: "1841",
            deathDate: "1919",
            locations:
              "Barnes Foundation (Philadelphia), Collection Gallery, Room 13, East Wall",
            creditLine: "",
            dimensions: "Overall: 29 1/8 x 39 3/8 in. (74 x 100 cm)",
            displayDate: "c. 1897",
            imageSecret: "z0kUqnz2LeclFl6c",
            nationality: "French",
            ensembleIndex: "50",
            classification: "Paintings",
            shortDescription:
              "<p>In this fantasy scene, seven young women play and relax by a pool in the woods. Soft strokes of rainbow color define the painting's composition and move the eye around to delight in the inviting landscape and splash of cool water against the bathers' velvety flesh. The subject matter and bright tones partly emulate 18th-century paintings by François Boucher and Jean-Honoré Fragonard. Albert Barnes's acquisition of this important painting in 1932 stirred substantial excitement from the press.</p>",
            visualDescription: "",
            curatorialApproval: "true",
            art_url:
              "https://barnes-images.imgix.net/5211_z0kUqnz2LeclFl6c_b.jpg",
          },
        },
        {
          image_id: "5183",
          short_paragraph: {
            html: "<p>Renoir is best known for his impressionist paintings made during the 1870s. Barnes vastly preferred Renoir’s later canvases, however, because they seemed modern and classical at the same time. This 1910 nude is a good example.</p>",
          },
          long_paragraph: {
            html: "<p>Renoir is best known for his impressionist paintings made during the 1870s. Barnes vastly preferred Renoir’s later canvases, however, because they seemed modern and classical at the same time. This 1910 nude is a good example.</p>",
          },
          detail: {
            id: 5183,
            room: "Room 13",
            invno: "BF142",
            title: "After the Bath (La Sortie du bain)",
            medium: "Oil on canvas",
            people: "Pierre-Auguste Renoir",
            culture: "",
            birthDate: "1841",
            deathDate: "1919",
            locations:
              "Barnes Foundation (Philadelphia), Collection Gallery, Room 13, West Wall",
            creditLine: "",
            dimensions: "Overall: 37 3/16 x 29 5/8 in. (94.5 x 75.2 cm)",
            displayDate: "1910",
            imageSecret: "UGuBgiKQmnioAztv",
            nationality: "French",
            ensembleIndex: "52",
            classification: "Paintings",
            shortDescription: "",
            visualDescription: "",
            curatorialApproval: "true",
            art_url:
              "https://barnes-images.imgix.net/5183_UGuBgiKQmnioAztv_b.jpg",
          },
        },
      ],
    },
    unique_identifier: "abcd123",
    total: 2,
    translated_title: "Why so many Renoirs?",
    link: "http://example.com/story/why-so-many-renoirs",
  },
};
