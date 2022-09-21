import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { EmailCard } from "../../components/EmailCard";

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

describe("EmailCard", () => {
  it("should match the snapshot when when email card is not clickable", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailCard
        onSubmitEmail={(email: string) => null}
        onEmailHeightReady={(height: any) => null}
        getTranslation={(args: any) => null}
        handleClickScroll={(storyIndex: any, isStoryCard: boolean) => null}
        artworkScrollOffset={0}
        emailCardClickable={false}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when email card is clickable", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailCard
        onSubmitEmail={(email: string) => null}
        onEmailHeightReady={(height: any) => null}
        getTranslation={(args: any) => null}
        handleClickScroll={(storyIndex: any, isStoryCard: boolean) => null}
        artworkScrollOffset={0}
        emailCardClickable={true}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
