import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Share } from "../../components/Share";

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

describe("Share", () => {
  it("should match the snapshot", () => {
    const renderer = new ShallowRenderer();
    renderer.render(<Share artwork={{}} shareText={"Text"} />, container);
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
