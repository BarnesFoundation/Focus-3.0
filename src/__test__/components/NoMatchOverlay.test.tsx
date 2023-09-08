import React from "react";
import { render, cleanup } from "@testing-library/react";
import { NoMatchOverlay } from "../../components/NoMatchOverlay";

afterEach(cleanup);

describe("NoMatchOverlay", () => {
  it("should match the snapshot", () => {
    const { container } = render(
      <NoMatchOverlay displayOverlay={true} handleScan={() => null} />
    );

    expect(container).toMatchSnapshot();
  });
});
