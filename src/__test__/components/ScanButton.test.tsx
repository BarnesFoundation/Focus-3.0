import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { ScanButton } from "../../components/ScanButton";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: () => null,
  }),
}));

let container;
configure({ adapter: new Adapter() }); //enzyme - react 16 hooks support

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("ScanButton", () => {
  it("should match the snapshot when float is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(<ScanButton float={true} />, container);
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when float is false", () => {
    const renderer = new ShallowRenderer();
    renderer.render(<ScanButton float={false} />, container);
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
