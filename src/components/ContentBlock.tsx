import React, { Fragment } from "react";
import sanitizeHtml from "sanitize-html";
import parse from "html-react-parser";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import ReactPlayer from "react-player/lazy";
import {
  ContentBlock as ContentBlockType,
  ContentBlockTypes,
} from "../types/payloadTypes";

type ContentBlockProps = {
  contentBlock: ContentBlockType[];
};

export const ContentBlock: React.FC<ContentBlockProps> = ({ contentBlock }) => {
  const formatHtml = (html) => {
    return parse(
      sanitizeHtml(html, {
        allowedTags: [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "blockquote",
          "li",
          "ol",
          "p",
          "ul",
          "a",
          "br",
          "code",
          "em",
          "span",
          "strong",
          "u",
          "table",
          "tbody",
          "td",
          "tfoot",
          "th",
          "thead",
          "tr",
        ],
        allowedAttributes: {
          a: ["href", "target"],
        },
      })
    );
  };

  return (
    <div className="content-block">
      {contentBlock.map((block, index) => (
        <Fragment key={index}>
          {/* Title Block */}
          {block.type === ContentBlockTypes.TITLE && (
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
          )}

          {/* Text Block */}
          {block.type === ContentBlockTypes.TEXT_BLOCK && (
            <div className="content-block__text">
              {formatHtml(block.textBlock.html)}
            </div>
          )}

          {/* Image Block */}
          {block.type === ContentBlockTypes.IMAGE && (
            <figure className="content-block__image">
              <img
                src={block.image.url}
                alt={block.altText ? block.altText : ""}
              />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          )}

          {/* Image Comparison Slider Block */}
          {block.type === ContentBlockTypes.IMAGE_COMPARISON && (
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
                {block.leftImage.caption && (
                  <figcaption className="caption-left">
                    Left: {block.leftImage.caption}
                  </figcaption>
                )}
                {block.rightImage.caption && (
                  <figcaption className="caption-right">
                    Right: {block.rightImage.caption}
                  </figcaption>
                )}
              </div>
            </figure>
          )}

          {/* Video Block */}
          {block.type === ContentBlockTypes.VIDEO && (
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
          )}
        </Fragment>
      ))}
    </div>
  );
};
