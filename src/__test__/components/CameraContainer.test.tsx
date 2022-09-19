import React from "react";
import { render, cleanup } from "@testing-library/react";

import { CameraContainerComponent } from "../../components/CameraContainer";

afterEach(cleanup);

describe("CameraContainer", () => {
  it("should match the snapshot", () => {
    const { container } = render(<CameraContainerComponent history={null} />);

    expect(container).toMatchSnapshot();
  });
});
