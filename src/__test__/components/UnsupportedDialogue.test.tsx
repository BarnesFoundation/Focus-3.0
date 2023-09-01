import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { UnsupportedDialogueComponent } from "../../components/UnsupportedDialogue";

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

describe("UnsupportedDialogue", () => {
  it("should match the snapshot when unsupportedIOSBrowser is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <UnsupportedDialogueComponent
        unsupportedIOSBrowser={true}
        unsupportedIOSVersion={false}
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
        updateTranslations={() => Promise.resolve(null)}
        langOptions={[]}
        getSelectedLanguage={() => Promise.resolve([])}
        updateSelectedLanguage={(language) => null}
        selectedLanguage={{ name: "English", code: "En", selected: true }}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when unsupportedIOSVersion is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <UnsupportedDialogueComponent
        unsupportedIOSBrowser={false}
        unsupportedIOSVersion={true}
        translations={null}
        loaded={true}
        getTranslation={(screen, textId) => textId + " " + screen}
        updateTranslations={() => Promise.resolve(null)}
        langOptions={[]}
        getSelectedLanguage={() => Promise.resolve([])}
        updateSelectedLanguage={(language) => null}
        selectedLanguage={{ name: "English", code: "En", selected: true }}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
