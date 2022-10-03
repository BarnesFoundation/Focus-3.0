import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import StoryItem, { StoryItemProps } from "../../components/StoryItem";

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

describe("StoryItem", () => {
  it("should match the snapshot", () => {
    const story: StoryItemProps["story"] = {
      detail: {
        art_url: "art_url",
        people: "people",
        title: "title",
        culture: "culture",
        nationality: "nationality",
        birthDate: "birthDate",
        deathDate: "deathDate",
        displayDate: "displayDate",
      },
      long_paragraph: {
        html: "html",
      },
      short_paragraph: {
        html: "html",
      },
    };

    const renderer = new ShallowRenderer();
    renderer.render(
      <StoryItem
        sceneStatus={{ type: "type", state: "state" }}
        statusCallback={(showTitle) => null}
        storyIndex={0}
        onStoryReadComplete={() => null}
        getSize={(scrollOffset, storyIndex) => null}
        storyEmailPage={false}
        isLastStoryItem={false}
        progress={0}
        story={story}
        storyTitle="Story Title"
        onVisChange={(isVisible, storyIndex) => null}
        selectedLanguage={{ code: "En" }}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
