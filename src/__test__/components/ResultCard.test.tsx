import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ResultCard } from "../../components/ResultCard";

afterEach(cleanup);

describe("ResultCard", () => {
  it("should match the snapshot for a Barnes collection object", () => {
    const { container } = render(
      <ResultCard
        getTranslation={(screen, textId) => textId + " " + screen}
        langOptions={[]}
        artwork={{
          bg_url: "bg_url",
          title: "title",
          artist: "artist",
          id: 123,
          invno: "invno",
        }}
        refCallbackInfo={(element: any) => null}
        setArtworkRef={(element: any) => null}
        selectedLanguage={{ code: null, name: null, selected: true }}
        onSelectLanguage={() => null}
        specialExhibition={false}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it("should match the snapshot for a special exhibition object", () => {
    const { container } = render(
      <ResultCard
        getTranslation={(screen, textId) => textId + " " + screen}
        langOptions={[]}
        artwork={{
          bg_url: "bg_url",
          title: "title",
          artist: "artist",
          id: 123,
          invno: "invno",
        }}
        refCallbackInfo={(element: any) => null}
        setArtworkRef={(element: any) => null}
        selectedLanguage={{ code: null, name: null, selected: true }}
        onSelectLanguage={() => null}
        specialExhibition={false}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
