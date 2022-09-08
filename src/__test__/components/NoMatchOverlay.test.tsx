import React from "react";
import { render, cleanup } from "@testing-library/react";
import { NoMatchOverlayComponent } from "../../components/NoMatchOverlay";

afterEach(cleanup);

describe("NoMatchOverlay", () => {
  it("should match the snapshot", () => {
    const { container } = render(
      <NoMatchOverlayComponent
        displayOverlay={true}
        handleScan={() => null}
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
