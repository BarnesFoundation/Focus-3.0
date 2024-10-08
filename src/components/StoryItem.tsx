import React from "react";
import { Timeline, Tween } from "react-gsap";
import { Linear, TimelineLite } from "gsap/all";
import barnes_logo from "../images/barnes_email_logo_1x.png";
import scroll_up from "../images/up_wht_1x.png";
import {
  LANGUAGE_EN,
  VIEWPORT_HEIGHT,
  SNAP_LANGUAGE_PREFERENCE,
} from "../constants";
import { isAndroid } from "react-device-detect";
import VizSensor from "react-visibility-sensor";

export type StoryItemProps = {
  sceneStatus: {
    type: string;
    state: string;
  };
  statusCallback?: (showTitle: boolean) => void;
  storyIndex: number;
  onStoryReadComplete: () => void;
  getSize: (scrollOffset: number, storyIndex: number) => void;
  storyEmailPage?: boolean;
  isLastStoryItem: boolean;
  progress: number;
  story: {
    detail: {
      art_url: string;
      people: string;
      title: string;
      culture: string;
      nationality: string;
      birthDate: string;
      deathDate: string;
      displayDate: string;
    };
    long_paragraph: {
      html: string;
    };
    short_paragraph: {
      html: string;
    };
  };
  storyTitle: string;
  onVisChange?: (isVisible: boolean, storyIndex: number) => void;
  selectedLanguage: {
    code: string;
  };
};

type StoryItemState = {
  storyRead: boolean;
  heightUpdated: boolean;
  scrollHeight: number;
  showTitle: boolean;
  scrollOffset?: number;
};

class StoryItem extends React.Component<StoryItemProps, StoryItemState> {
  contentRef: HTMLDivElement;
  titleRef: HTMLDivElement;
  overlayRef: HTMLDivElement;
  scrollCtaRef: HTMLDivElement;
  masterTimeline;
  imgTopTimeline;
  overlayTimeline;
  masterTimelineGSAP;
  imgTopTimelineGSAP;
  overlayTimelineGSAP;
  scrollInProgress: boolean;
  t2: TimelineLite;

  constructor(props) {
    super(props);

    this.state = {
      storyRead: false,
      heightUpdated: false,
      scrollHeight: 0,
      showTitle: true,
    };

    // Initialize GSAPs
    this.masterTimelineGSAP = null;
    this.imgTopTimelineGSAP = null;
    this.overlayTimelineGSAP = null;
  }

  componentDidMount() {
    this.scrollInProgress = false;
    this.setState({ scrollHeight: this.contentRef.clientHeight });
    this.t2 = new TimelineLite({ paused: true });

    this.masterTimelineGSAP = this.masterTimeline.getGSAP();
    this.imgTopTimelineGSAP = this.imgTopTimeline.getGSAP();
    this.overlayTimelineGSAP = this.overlayTimeline.getGSAP();
  }

  componentWillReceiveProps(nextProps) {
    // Handles marking this story as being read by the user
    if (nextProps.sceneStatus.type === "start" && nextProps.storyIndex === 2) {
      if (!this.state.storyRead) {
        this.setState({ storyRead: true });
        this.props.onStoryReadComplete();
      }
    }

    if (nextProps.sceneStatus.type === "start" && nextProps.storyIndex === 0) {
      // Whether title should be shown
      let showTitle =
        nextProps.sceneStatus.type === "start" &&
        nextProps.sceneStatus.state === "DURING";

      // Executes display of the title
      if (
        this.props.sceneStatus.state != nextProps.sceneStatus.state ||
        this.props.sceneStatus.type === "enter"
      ) {
        if (this.props.statusCallback) this.props.statusCallback(showTitle);
        this.setState({ showTitle: !showTitle });
      }
    }
  }

  componentDidUpdate() {
    if (!this.state.heightUpdated) {
      const contentHeight = this.contentRef.getBoundingClientRect().height;
      let scrollOffset =
        contentHeight > VIEWPORT_HEIGHT
          ? contentHeight - VIEWPORT_HEIGHT + 67
          : 0;

      if (scrollOffset < 0) {
        scrollOffset = 0;
      }

      this.props.getSize(scrollOffset, this.props.storyIndex);
      this.setState({ heightUpdated: true, scrollOffset });

      // Handleing for the for story in the list
      if (this.props.storyIndex === 0) {
        // Handling for story email page
        if (this.props.storyEmailPage) {
          this.t2
            .fromTo(this.overlayRef, 0.1, { autoAlpha: 0.5 }, { autoAlpha: 0 })
            .fromTo(this.titleRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
            .fromTo(this.scrollCtaRef, 1, { opacity: 1 }, { opacity: 0 }, 0)
            .fromTo(
              this.contentRef,
              0.1,
              { autoAlpha: 0, y: "50px" },
              { autoAlpha: 1, y: "0px" },
              "-=0.1"
            )
            .fromTo(
              this.contentRef,
              1.0,
              { y: "0px" },
              { y: -scrollOffset, ease: Linear.easeNone },
              "-=0.1"
            );
        }

        // Handling for normal story component
        else {
          this.t2
            .fromTo(
              this.overlayRef,
              0.1,
              { autoAlpha: 0.5 },
              { autoAlpha: 0 },
              0
            )
            .fromTo(
              this.contentRef,
              0.15,
              { autoAlpha: 0.01, y: "50px" },
              { autoAlpha: 1, y: "0px" },
              0
            )
            .fromTo(
              this.contentRef,
              1.0,
              { y: "0px" },
              { y: -scrollOffset, ease: Linear.easeNone },
              "-=0.16"
            );
        }
      }

      // Handling for the last story in the list
      else if (this.props.isLastStoryItem) {
        this.t2
          .fromTo(
            this.contentRef,
            0.15,
            { autoAlpha: 0.01, y: "50px" },
            { autoAlpha: 1, y: "0px" }
          )
          .fromTo(
            this.contentRef,
            1.0,
            { y: "0px" },
            { y: -scrollOffset, ease: Linear.easeNone },
            "-=0.16"
          );
      }

      // Handling for all other stories in the list
      else {
        this.t2
          .fromTo(
            this.contentRef,
            0.15,
            { autoAlpha: 0.01, y: "50px" },
            { autoAlpha: 1, y: "0px" }
          )
          .fromTo(
            this.contentRef,
            1.0,
            { y: "0px" },
            { y: -scrollOffset, ease: Linear.easeNone },
            "-=0.16"
          );
      }
    }

    if (this.t2) {
      this.t2.progress(this.props.progress * 4);
    }
  }

  componentWillUnmount() {
    // Unhook the GSAP plugins and timelines when this component is unmounting
    this.masterTimelineGSAP.remove();
    this.masterTimelineGSAP.kill();
    this.imgTopTimelineGSAP.remove();
    this.imgTopTimelineGSAP.kill();
    this.overlayTimelineGSAP.remove();
    this.overlayTimelineGSAP.kill();

    this.t2.remove();
    this.t2.kill();
  }

  /** Generates the url for retrieving the artwork with transformation parameters */
  getArtUrl = () => {
    return `${this.props.story.detail?.art_url}?crop=faces,entropy&fit=crop&w=${screen.width}&h=${screen.height}`;
  };

  /** Returns boolean whether or not the artist is unidentified */
  isUnidentifiedArtist = () => {
    return this.props.story.detail?.people
      .toLowerCase()
      .includes("unidentified");
  };

  /** Generates the aria-label for the background image */
  generateImageAriaLabel = () => {
    if (!this.props.story.detail) {
      return "";
    }

    const { title, people, culture } = this.props.story.detail;
    return `${title} by ${people}${
      this.isUnidentifiedArtist() ? `, ${culture}` : ""
    } used as a background image`;
  };

  render() {
    const {
      story,
      storyTitle,
      progress,
      storyIndex,
      storyEmailPage,
      onVisChange,
    } = this.props;
    const { showTitle } = this.state;

    // Change the font size for russian language
    const paragraphFontStyle =
      localStorage.getItem(SNAP_LANGUAGE_PREFERENCE) === "Ru"
        ? { fontSize: `16px` }
        : {};

    // Determines appropriate offset of the story card peeking. 67 + 56 = 123 (address bar height compensation for Android)
    const peekOffsetStyle =
      isAndroid && storyIndex === 0
        ? { transform: "translate3d(0px, -123px, 0px)" }
        : { transform: "translate3d(0px, -67px, 0px)" };

    return (
      <div>
        <Timeline
          totalProgress={progress}
          paused
          ref={(ref) => (this.masterTimeline = ref)}
        >
          <div
            className="card story-item"
            style={peekOffsetStyle}
            data-story-card={storyIndex}
            id={this.props.isLastStoryItem ? "story-item-last" : "story-item"}
            data-story-card-last={this.props.isLastStoryItem}
          >
            {/** Only show the story title for the first card */}
            {storyIndex === 0 && showTitle && !storyEmailPage && (
              <div className="story-title-bar">
                <div className="story-title">{storyTitle}</div>
              </div>
            )}

            {/** Displays the background image of the story item */}
            <Timeline
              totalProgress={progress * 5}
              paused
              ref={(ref) => (this.imgTopTimeline = ref)}
              target={
                <img
                  className="card-img-top"
                  src={this.getArtUrl()}
                  alt="story_item"
                  style={{ width: `100%` }}
                  role="img"
                  aria-label={this.generateImageAriaLabel()}
                />
              }
            >
              {
                <Tween
                  from={{ css: { borderRadius: "24px 24px 0px 0px" } }}
                  to={{ css: { borderRadius: "0px 0px 0px 0px" } }}
                  ease="easeOut"
                  duration={0.2}
                />
              }
            </Timeline>

            {/** Displays the overlay */}
            <Timeline
              totalProgress={progress * 5}
              paused
              target={<div className="overlay" />}
              ref={(ref) => (this.overlayTimeline = ref)}
            >
              <Tween
                from={{ autoAlpha: 0, borderRadius: "24px 24px 0px 0px" }}
                to={{ autoAlpha: 0.6, borderRadius: "0px 0px 0px 0px" }}
                ease="easeOut"
                duration={0.1}
              />
            </Timeline>

            {this.props.storyIndex === 0 && (
              <div
                className="overlay"
                ref={(c) => (this.overlayRef = c)}
                id="overlayRef"
              />
            )}

            <div className="content-mask">
              <div className="card-img-overlay">
                {/** In the email page, for the first story item */}
                {storyEmailPage && storyIndex === 0 && (
                  <div>
                    <div
                      className="intro"
                      ref={(c) => (this.titleRef = c)}
                      id="titleRef"
                    >
                      <div className="barnes-logo">
                        <img src={barnes_logo} alt="barnes_logo" />
                        <div className="story-name">{storyTitle}</div>
                      </div>
                    </div>
                    <div
                      className="scroll-cta"
                      ref={(c) => (this.scrollCtaRef = c)}
                      id="scrollCtaRef"
                    >
                      <div className="scroll-icon">
                        <img src={scroll_up} alt="scroll" />
                      </div>
                      <div className="text">{`Scroll to Begin`}</div>
                    </div>
                  </div>
                )}

                {/** Scroll text section */}
                <div
                  className="scroll-text"
                  ref={(c) => (this.contentRef = c)}
                  id="contentRef"
                >
                  {/** Display the story title for non-story email pages */}
                  {!storyEmailPage && (
                    <div
                      className="story-name"
                      id={`story-here-${storyIndex}`}
                      aria-hidden={storyIndex === 0 ? false : true}
                    >
                      {storyTitle}
                    </div>
                  )}

                  {/** Captures when the story paragraph is in view to notify the parent component */}
                  <VizSensor
                    onChange={(isVisible) => {
                      onVisChange && onVisChange(isVisible, storyIndex);
                    }}
                  >
                    <div
                      className="story-text"
                      id={`story-text-${storyIndex}`}
                      style={paragraphFontStyle}
                      dangerouslySetInnerHTML={{
                        __html:
                          process.env.STORY_PARAGRAPH_TO_USE === "long"
                            ? story.long_paragraph.html
                            : story.short_paragraph.html,
                      }}
                    />
                  </VizSensor>

                  {/** Story footer section */}
                  <div
                    className="story-footer"
                    style={{
                      paddingBottom:
                        this.props.selectedLanguage.code === LANGUAGE_EN
                          ? `200px`
                          : 0,
                    }}
                  >
                    {`${story.detail.title}, ${story.detail.displayDate}`}
                    <br />

                    {/** Display additional information about the artist */}
                    {`${story.detail.people}
										
										${
                      this.isUnidentifiedArtist()
                        ? ""
                        : ` (${story.detail.nationality}, ${story.detail.birthDate} - ${story.detail.deathDate})`
                    }
										${this.isUnidentifiedArtist() ? `, ${story.detail.culture}` : ""}`}
                  </div>

                  {/** Display the translation disclaimer */}
                  {this.props.selectedLanguage.code !== LANGUAGE_EN && (
                    <div
                      className="google-translate-disclaimer"
                      style={{ paddingBottom: `200px` }}
                    >
                      Translated with AWS
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Timeline>
      </div>
    );
  }
}

export default StoryItem;
