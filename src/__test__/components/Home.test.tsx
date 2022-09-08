import React from "react";
import { render, cleanup } from "@testing-library/react";
import { HomeComponent } from "../../components/Home";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: () => null,
  }),
}));

afterEach(cleanup);

describe("Home", () => {
  it("should match the snapshot", () => {
    const { container } = render(
      <HomeComponent
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
