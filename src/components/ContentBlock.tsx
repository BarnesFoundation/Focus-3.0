import React from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import ReactPlayer from "react-player/lazy";
import AliceCarousel from "react-alice-carousel";
import {
  formatHtml,
  formatHtmlCaption,
  formatHtmlTitle,
} from "../helpers/artWorkHelper";
import {
  ContentBlock as ContentBlockType,
  ContentBlockTypes,
  ImageComparisonStyle,
} from "../types/payloadTypes";

import arrowLeft from "../images/arrow-left.svg";
import arrowRight from "../images/arrow-right.svg";

type ContentBlockProps = {
  contentBlock: ContentBlockType[];
};

export const ContentBlock: React.FC<ContentBlockProps> = ({ contentBlock }) => (
  <div className="content-block">
    {contentBlock.map((block, index) => {
      switch (block.__typename) {
        // Title Block
        case ContentBlockTypes.TITLE:
          return (
            <div className="content-block__title-block" key={index}>
              {block.titleHtml && (
                <div className="content-block__title-block__title">
                  {formatHtmlTitle(block.titleHtml.html)}
                </div>
              )}
              {block.subtitleHtml && (
                <div className="content-block__title-block__subtitle">
                  {formatHtmlTitle(block.subtitleHtml.html)}
                </div>
              )}
            </div>
          );

        // Text Block
        case ContentBlockTypes.TEXT_BLOCK:
          return (
            <div className="content-block__text" key={index}>
              {formatHtml(block.textBlock.html)}
            </div>
          );

        // Image Block
        case ContentBlockTypes.IMAGE:
          return (
            <figure className="content-block__image" key={index}>
              <img
                src={block.image.url}
                alt={block.altText ? block.altText : ""}
              />
              {block.caption?.html && (
                <figcaption>{formatHtmlCaption(block.caption.html)}</figcaption>
              )}
            </figure>
          );

        // Image Carousel Block
        case ContentBlockTypes.IMAGE_CAROUSEL:
          return (
            <div className="content-block__image-carousel" key={index}>
              <AliceCarousel
                controlsStrategy="alternate"
                infinite={true}
                renderPrevButton={() => {
                  return (
                    <img
                      src={arrowLeft}
                      alt="<"
                      style={{ position: "absolute", left: "0", top: "-30px" }}
                    />
                  );
                }}
                renderNextButton={() => {
                  return (
                    <img
                      src={arrowRight}
                      alt=">"
                      style={{ position: "absolute", right: "0", top: "-30px" }}
                    />
                  );
                }}
                responsive={{ 0: { items: 1 } }}
              >
                {block.imageCarousel.map((img, i) => (
                  <figure
                    key={i}
                    className="content-block__image-carousel__item"
                  >
                    <img
                      src={img.image.url}
                      alt={img?.caption?.html}
                      onDragStart={(e) => e.preventDefault()}
                      style={{ height: "65vh" }}
                    />
                    {img.caption?.html && (
                      <figcaption>
                        {formatHtmlCaption(img.caption.html)}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </AliceCarousel>
            </div>
          );

        // Image Comparison Slider Block
        case ContentBlockTypes.IMAGE_COMPARISON:
          return (
            <div key={index} style={{ position: "relative" }}>
              {block.style === ImageComparisonStyle.SLIDER && (
                <figure className="content-block__comparison">
                  <ReactCompareSlider
                    itemOne={
                      <ReactCompareSliderImage
                        src={block.leftImage.image.url}
                        alt={
                          block.leftImage.altText ? block.leftImage.altText : ""
                        }
                      />
                    }
                    itemTwo={
                      <ReactCompareSliderImage
                        src={block.rightImage.image.url}
                        alt={
                          block.rightImage.altText
                            ? block.rightImage.altText
                            : ""
                        }
                      />
                    }
                  />
                  <div className="content-block__comparison__caption">
                    {block.leftImage.caption?.html && (
                      <figcaption className="caption-left">
                        Left: {formatHtmlCaption(block.leftImage.caption.html)}
                      </figcaption>
                    )}
                    {block.rightImage.caption?.html && (
                      <figcaption className="caption-right">
                        Right:{" "}
                        {formatHtmlCaption(block.rightImage.caption.html)}
                      </figcaption>
                    )}
                  </div>
                </figure>
              )}
              {block.style === ImageComparisonStyle.ANIMATION_FADE && (
                <figure className="content-block__fader">
                  <img
                    id={"fadeImg2" + index}
                    className="content-block__fade-image fade-two"
                    src={block.leftImage.image.url}
                    alt={block.leftImage.altText ? block.leftImage.altText : ""}
                  />
                  <img
                    id={"fadeImg1" + index}
                    className="content-block__fade-image fade-one"
                    src={block.rightImage.image.url}
                    alt={
                      block.rightImage.altText ? block.rightImage.altText : ""
                    }
                  />
                  <div className="content-block__comparison__caption-fade">
                    {block.leftImage.caption?.html && (
                      <figcaption className="caption-left">
                        {/* Image 1:{" "} */}
                        {formatHtmlCaption(block.leftImage.caption.html)}
                      </figcaption>
                    )}
                    {block.rightImage.caption?.html && (
                      <figcaption className="caption-left">
                        {/* Image 2:{" "} */}
                        {formatHtmlCaption(block.rightImage.caption.html)}
                      </figcaption>
                    )}
                  </div>
                </figure>
              )}
            </div>
          );

        // Video Block
        case ContentBlockTypes.VIDEO:
          return (
            <ReactPlayer
              className="content-block__video"
              url={block.url}
              volume={0}
              muted={true}
              width="100%"
              height="fit-content"
              playsinline={true}
              pip={false}
              controls={true}
              key={index}
            />
          );

        default:
          return null;
      }
    })}
  </div>
);
