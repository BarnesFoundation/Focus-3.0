import React, { createRef } from "react";
import { render, cleanup } from "@testing-library/react";
import { ResultCard } from "../../components/ResultCard";

afterEach(cleanup);

describe("ResultCard", () => {
  it("should match the snapshot for a Barnes collection object", () => {
    const { container } = render(
      <ResultCard
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
        updateTranslations={() => Promise.resolve(null)}
        langOptions={[]}
        getSelectedLanguage={() => Promise.resolve([])}
        updateSelectedLanguage={(language) => null}
        artwork={{
          bg_url: "bg_url",
          title: "title",
          artist: "artist",
          id: "id",
          invno: "invno",
        }}
        refCallbackInfo={createRef()}
        setArtworkRef={createRef()}
        selectedLanguage={"EN"}
        onSelectLanguage={() => null}
        shortDescContainer={createRef()}
        specialExhibition={false}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it("should match the snapshot for a special exhibition object", () => {
    const { container } = render(
      <ResultCard
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
        updateTranslations={() => Promise.resolve(null)}
        langOptions={[]}
        getSelectedLanguage={() => Promise.resolve([])}
        updateSelectedLanguage={(language) => null}
        artwork={{
          bg_url: "bg_url",
          title: "title",
          artist: "artist",
          id: "id",
          invno: "invno",
        }}
        refCallbackInfo={createRef()}
        setArtworkRef={createRef()}
        selectedLanguage={"EN"}
        onSelectLanguage={() => null}
        shortDescContainer={createRef()}
        specialExhibition={false}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
