import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { EmailForm } from "../../components/EmailForm";

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

describe("EmailForm", () => {
  it("should match the snapshot when withStory is false and pointerEvents is 'none'", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailForm
        withStory={false}
        onSubmitEmail={(email: any) => null}
        getSize={(height: any) => null}
        getTranslation={(args: any) => null}
        isEmailScreen={true}
        pointerEvents="none"
        handleClickScroll={(storyIndex: any, isStoryCard: boolean) => null}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when withStory is true and pointerEvents is 'auto'", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailForm
        withStory={true}
        onSubmitEmail={(email: any) => null}
        getSize={(height: any) => null}
        getTranslation={(args: any) => null}
        isEmailScreen={true}
        pointerEvents="auto"
        handleClickScroll={(storyIndex: any, isStoryCard: boolean) => null}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
