import React from "react";
import { render, cleanup } from "@testing-library/react";

import { CameraComponent } from "../../components/Camera";

afterEach(cleanup);

describe("Camera", () => {
  it("should match the snapshot when session yielded match is true", () => {
    const { container } = render(
      <CameraComponent
        sessionYieldedMatch={true}
        beginScanning={() => null}
        snapAttempts={0}
        shouldBeScanning={false}
        processImageCapture={async (blog) => null}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it("should match the snapshot when session yielded match is false", () => {
    const { container } = render(
      <CameraComponent
        sessionYieldedMatch={false}
        beginScanning={() => null}
        snapAttempts={0}
        shouldBeScanning={false}
        processImageCapture={async (blog) => null}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it("should match the snapshot when session should be scanning is true", () => {
    const { container } = render(
      <CameraComponent
        sessionYieldedMatch={false}
        beginScanning={() => null}
        snapAttempts={0}
        shouldBeScanning={true}
        processImageCapture={async (blog) => null}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
