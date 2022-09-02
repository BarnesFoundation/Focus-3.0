import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { EmailFormInput } from "../../components/EmailFormInput";

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

describe("EmailFormInput", () => {
  it("should match the snapshot when isEmailScreen is true and withStory is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailFormInput
        getTranslation={(args: any) => null}
        isEmailScreen={true}
        withStory={true}
        error={false}
        email="test@example.com"
        handleEmailInput={(event) => null}
        saveEmail={() => null}
        verificationPending={false}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when isEmailScreen is false and withStory is false", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailFormInput
        getTranslation={(args: any) => null}
        isEmailScreen={false}
        withStory={false}
        error={false}
        email="test@example.com"
        handleEmailInput={(event) => null}
        saveEmail={() => null}
        verificationPending={false}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when error is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailFormInput
        getTranslation={(args: any) => null}
        isEmailScreen={false}
        withStory={false}
        error={true}
        email="test@example.com"
        handleEmailInput={(event) => null}
        saveEmail={() => null}
        verificationPending={false}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });

  it("should match the snapshot when verificationPending is true", () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <EmailFormInput
        getTranslation={(args: any) => null}
        isEmailScreen={false}
        withStory={false}
        error={false}
        email="test@example.com"
        handleEmailInput={(event) => null}
        saveEmail={() => null}
        verificationPending={true}
      />,
      container
    );
    const result = renderer.getRenderOutput();

    expect(result).toMatchSnapshot();
  });
});
