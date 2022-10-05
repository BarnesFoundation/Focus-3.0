import React, { Fragment } from "react";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import ReactPlayer from "react-player/lazy";
import { formatHtml } from "../helpers/artWorkHelper";
import {
  ContentBlock as ContentBlockType,
  ContentBlockTypes,
} from "../types/payloadTypes";

type ContentBlockProps = {
  contentBlock: ContentBlockType[];
};

export const ContentBlock: React.FC<ContentBlockProps> = ({ contentBlock }) => (
  <div className="content-block">
    {contentBlock.map((block, index) => {
      switch (block.type) {
        // Title Block
        case ContentBlockTypes.TITLE:
          return (
            <div className="content-block__title-block">
              {block.title && (
                <div className="content-block__title-block__title">
                  {block.title}
                </div>
              )}
              {block.subtitle && (
                <div className="content-block__title-block__subtitle">
                  {block.subtitle}
                </div>
              )}
            </div>
          );

        // Text Block
        case ContentBlockTypes.TEXT_BLOCK:
          return (
            <div className="content-block__text">
              {formatHtml(block.textBlock.html)}
            </div>
          );

        // Image Block
        case ContentBlockTypes.IMAGE:
          return (
            <figure className="content-block__image">
              <img
                src={block.image.url}
                alt={block.altText ? block.altText : ""}
              />
              {block.caption?.html && (
                <figcaption>{formatHtml(block.caption.html)}</figcaption>
              )}
            </figure>
          );

        // Image Comparison Slider Block
        case ContentBlockTypes.IMAGE_COMPARISON:
          return (
            <figure className="content-block__comparison">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={block.leftImage.image.url}
                    alt={block.leftImage.altText ? block.leftImage.altText : ""}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={block.rightImage.image.url}
                    alt={
                      block.rightImage.altText ? block.rightImage.altText : ""
                    }
                  />
                }
              />
              <div className="content-block__comparison__caption">
                {block.leftImage.caption?.html && (
                  <figcaption className="caption-left">
                    Left: {formatHtml(block.leftImage.caption.html)}
                  </figcaption>
                )}
                {block.rightImage.caption?.html && (
                  <figcaption className="caption-right">
                    Right: {formatHtml(block.rightImage.caption.html)}
                  </figcaption>
                )}
              </div>
            </figure>
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
            />
          );

        default:
          return null;
      }
    })}
  </div>
);
