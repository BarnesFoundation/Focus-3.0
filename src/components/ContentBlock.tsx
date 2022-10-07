import React, { Fragment } from "react";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import ReactPlayer from "react-player/lazy";
import { formatHtml, formatHtmlCaption, formatHtmlTitle } from "../helpers/artWorkHelper";
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
            <div className="content-block__title-block" key={index}>
              {console.log(block)}
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

        // Image Comparison Slider Block
        case ContentBlockTypes.IMAGE_COMPARISON:
          return (
            <figure className="content-block__comparison" key={index}>
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
                    Left: {formatHtmlCaption(block.leftImage.caption.html)}
                  </figcaption>
                )}
                {block.rightImage.caption?.html && (
                  <figcaption className="caption-right">
                    Right: {formatHtmlCaption(block.rightImage.caption.html)}
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
              key={index}
            />
          );

        default:
          return null;
      }
    })}
  </div>
);
