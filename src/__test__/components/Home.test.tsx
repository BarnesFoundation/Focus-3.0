import React from "react";
import { unmountComponentAtNode } from "react-dom";
import { create } from "react-test-renderer";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import Home from "../../components/Home";

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

describe("Home", () => {
  it("should match the snapshot", () => {
    const renderer = create(<Home />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
