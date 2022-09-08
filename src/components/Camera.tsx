import React, { Component } from "react";
import { compose } from "redux";
import { cropPhoto } from "./CameraHelper";
import * as constants from "../constants";
import withOrientation from "./withOrientation";
import withTranslation from "./withTranslation";
import { shouldLogPermissionGrantTime } from "../helpers/googleAnalyticsHelpers";
import { NoMatchOverlay } from "./NoMatchOverlay";

const DISABLE_ZOOM = "DISABLE_ZOOM";
const ENABLE_ZOOM = "ENABLE_ZOOM";

type CameraProps = {
  sessionYieldedMatch: boolean;
  beginScanning: () => void;
  snapAttempts: number;
  shouldBeScanning: boolean;
  processImageCapture: (imageBlob: any) => Promise<void>;
};

type CameraState = {
  videoStream: MediaStream;
  frontCamera: boolean;
  snapAttempts: CameraProps["snapAttempts"];
  error?: string;
};

class Camera extends Component<CameraProps, CameraState> {
  cropRectangle: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scan: NodeJS.Timer;
  captureCounter: number;
  previewCanvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  vpreview: HTMLCanvasElement;
  initVideo: NodeJS.Timeout;
  drawPreview: NodeJS.Timeout;
  tempCanvas: HTMLCanvasElement;
  tempCtx: CanvasRenderingContext2D;

  constructor(props) {
    super(props);

    // Set state variables
    this.state = {
      videoStream: null,
      frontCamera: false,
      snapAttempts: this.props.snapAttempts,
    };
  }

  resetSnapCounter = () => {
    let lastSnapTimestamp = parseInt(
      localStorage.getItem(constants.SNAP_LAST_TIMESTAMP)
    );

    if (lastSnapTimestamp) {
      let ttl =
        lastSnapTimestamp + constants.SNAP_COUNT_RESET_INTERVAL - Date.now();

      if (ttl <= 0 && this.state.snapAttempts > 0) {
        localStorage.removeItem(constants.SNAP_ATTEMPTS);
        this.setState({ snapAttempts: 0 });
      }
    }
  };

  /** Captures a single scan and returns blob of the scan */
  captureSingleScan = async () => {
    this.captureCounter += 1;

    if (this.captureCounter < 10) {
      // Get image in canvas
      let canvas = this.previewCanvas;

      if (!canvas) return null;

      // Get the blob from canvas
      const imageBlob = await new Promise((resolve) => {
        canvas.toBlob(async (blob) => resolve(blob), "image/jpeg", 0.75);
      });

      this.props.processImageCapture(imageBlob);
    }
  };

  playVideo = async () => {
    if (this.video) {
      try {
        await this.video.play();

        const track = this.state.videoStream.getVideoTracks()[0];

        // Begin scanning
        requestAnimationFrame(this.drawVideoPreview);
      } catch (error) {
        console.log("Cannot play video stream", error);
      }
    }
  };

  async componentDidMount() {
    // Disable zoom
    this.pinchZoomModifier(DISABLE_ZOOM);

    const previewBox = this.vpreview.getBoundingClientRect();
    const { x, y, width, height } = previewBox;
    this.cropRectangle = {
      x: Math.floor(x),
      y: Math.floor(y),
      width: Math.floor(width),
      height: Math.floor(height),
    };

    // Fetch the device camera
    try {
      const startTime = Date.now();
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.state.frontCamera ? "user" : "environment",
          width: 1920,
          height: 1080,
        },
      });

      // Log the permission grant time if it took more than 900 ms
      // TODO - fix this
      // shouldLogPermissionGrantTime(startTime);

      this.setState({ videoStream }, () => {
        // When video is able to be captured
        if (this.state.videoStream) {
          this.setupForCapturing();
          this.resetSnapCounter();
        }
      });
    } catch (error) {
      this.setState({ error: "An error occurred accessing the device camera" });
    }
  }

  /* Prevents zoom */
  disablePinchZoom = (event) => {
    event.preventDefault();
  };

  /* Beginning with iOS 10, the "user-scalable=no" attribute is no longer supported. This function will disable page zoom on-pinch for the camera page */
  pinchZoomModifier = (action) => {
    const cameraContainer = document.querySelector(".camera");

    if (action === DISABLE_ZOOM) {
      cameraContainer.addEventListener(
        "touchmove",
        this.disablePinchZoom,
        false
      );
    }

    if (action === ENABLE_ZOOM) {
      cameraContainer.removeEventListener("touchmove", this.disablePinchZoom);
    }
  };

  stopVideo = () => {
    if (this.initVideo) {
      clearTimeout(this.initVideo);
    }
  };

  stopPreview = () => {
    if (this.drawPreview) {
      clearTimeout(this.drawPreview);
    }
  };

  setupForCapturing = async () => {
    this.video.srcObject = this.state.videoStream;
    this.stopVideo();
    this.initVideo = setTimeout(() => {
      this.playVideo();
    }, 50);
    this.captureCounter = 0;

    this.scan = await new Promise((resolve) => {
      setTimeout(() => {
        const scan = setInterval(this.captureSingleScan, 1000 / 3);
        resolve(scan);
      }, 500);
    });
  };

  async componentDidUpdate(previousProps) {
    console.log(
      `previous shouldBeScanning: ${previousProps.shouldBeScanning} current shouldBeScanning: ${this.props.shouldBeScanning}, current sessionYieldedMatch: ${this.props.sessionYieldedMatch}`
    );

    if (
      !previousProps.shouldBeScanning &&
      this.props.shouldBeScanning == true
    ) {
      await this.setupForCapturing();
    }

    if (this.props.shouldBeScanning == false) {
      clearInterval(this.scan);
    }
  }

  componentWillUnmount() {
    // Stop drawing the video
    this.stopVideo();
    this.stopPreview();

    // Turn off video capture
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();

    // Re-enable zoom
    this.pinchZoomModifier(ENABLE_ZOOM);
  }

  /** Return a temporary canvas and context for drawing the video */
  getTempPreviewCanvas = () => {
    const rect = this.video.getBoundingClientRect();
    if (!this.tempCanvas) {
      let tempCanvas = document.createElement("canvas");
      let tempCtx = tempCanvas.getContext("2d", { alpha: false });
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;

      this.tempCanvas = tempCanvas;
      this.tempCtx = tempCtx;
    }
    const { tempCanvas, tempCtx } = this;
    return { tempCanvas, tempCtx };
  };

  /** Draws the portion of the video visible within the preview onto a canvas, in a loop. */
  drawVideoPreview = () => {
    try {
      if (!this.vpreview /*  || this.props.sessionYieldedMatch === null */) {
        return null;
      }

      let { tempCanvas, tempCtx } = this.getTempPreviewCanvas();

      let previewCanvas = this.vpreview;
      let previewContext = previewCanvas.getContext("2d", { alpha: false });
      previewCanvas.width = this.cropRectangle.width;
      previewCanvas.height = this.cropRectangle.height;

      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);

      previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewContext.drawImage(
        tempCanvas,
        this.cropRectangle.x,
        this.cropRectangle.y,
        this.cropRectangle.width,
        this.cropRectangle.height,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
      );

      this.previewCanvas = previewContext.canvas;

      this.stopPreview();
      this.drawPreview = setTimeout(() => {
        requestAnimationFrame(this.drawVideoPreview);
      }, 10);
    } catch (error) {
      console.log("Error setting camera preview");
      // TODO: re-enable the GA tracking
      // ga("send", {
      //   hitType: "event",
      //   eventCategory: constants.GA_EVENT_CATEGORY.CAMERA,
      //   eventAction: constants.GA_EVENT_ACTION.SCAN,
      //   eventLabel: constants.GA_EVENT_LABEL.SCANNER_MOUNT_FAILURE,
      // });
    }
  };

  render() {
    const { beginScanning, sessionYieldedMatch, shouldBeScanning } = this.props;

    let videoStyle = { filter: `blur(25px)`, transform: `scale(1.2)` };

    return (
      <div className="camera">
        {/* If scanning should be occurring */}
        {
          <div>
            {/* Get video */}
            {
              <video
                id="video"
                ref={(c) => (this.video = c)}
                width="100%"
                autoPlay
                playsInline
                muted
                style={videoStyle}
              />
            }

            {/* Show the video preview if an unsuccessful attempt has not occurred */}
            {sessionYieldedMatch !== false && (
              <canvas id="video-preview" ref={(el) => (this.vpreview = el)} />
            )}

            {/* If there was an unsuccessful attempt, transition into the no result found */}
            <NoMatchOverlay
              displayOverlay={
                shouldBeScanning === false && sessionYieldedMatch === false
              }
              handleScan={() => beginScanning()}
            />
          </div>
        }
      </div>
    );
  }
}

export default compose(withOrientation, withTranslation)(Camera);
