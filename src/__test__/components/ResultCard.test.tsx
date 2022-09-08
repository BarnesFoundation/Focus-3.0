import React, { createRef } from "react";
import { render, cleanup } from "@testing-library/react";
import { ResultCardComponent } from "../../components/ResultCard";

afterEach(cleanup);

describe("ResultCard", () => {
  it("should match the snapshot for a Barnes collection object", () => {
    const { container } = render(
      <ResultCardComponent
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
        artwork={{
          bg_url: "bg_url",
          title: "title",
          artist: "artist",
          id: "id",
          invno: "invno",
        }}
        refCallbackInfo={createRef()}
        setArtworkRef={createRef()}
        langOptions={[]}
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
      <ResultCardComponent
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
        artwork={{
          bg_url: "bg_url",
          title: "title",
          artist: "artist",
          id: "id",
          invno: "invno",
        }}
        refCallbackInfo={createRef()}
        setArtworkRef={createRef()}
        langOptions={[]}
        selectedLanguage={"EN"}
        onSelectLanguage={() => null}
        shortDescContainer={createRef()}
        specialExhibition={false}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
