import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { UnsupportedDialogue } from "../../components/UnsupportedDialogue";
import { TranslationContextProvider } from "../../contexts/TranslationContext";

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
      <TranslationContextProvider
      // @ts-ignore
        value={{
          translations: {},
          getTranslations: (screen: string, textId: string) =>
            "Test Translation!",
        }}
      >
        <UnsupportedDialogue
          unsupportedIOSBrowser={true}
          unsupportedIOSVersion={false}
        />
      </TranslationContextProvider>,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when unsupportedIOSVersion is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <TranslationContextProvider
      // @ts-ignore
        value={{
          translations: {},
          getTranslations: (screen: string, textId: string) =>
            "Test Translation!",
        }}
      >
        <UnsupportedDialogue
          unsupportedIOSBrowser={false}
          unsupportedIOSVersion={true}
        />
      </TranslationContextProvider>,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
