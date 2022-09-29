import React, { Fragment } from "react";
import sanitizeHtml from "sanitize-html";
import parse from "html-react-parser";
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
          "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "li", "ol", "p",
          "ul", "a", "br", "code", "em", "span", "strong", "u", "table",
          "tbody", "td", "tfoot", "th", "thead", "tr",
        ],
        allowedAttributes: {
          a: ["href", "target"]
        }
      })
    );
  };

  return (
    <div className="content-block">
      {contentBlock.map((block, index) => (
        <Fragment key={index}>
          <div>{block.type}</div>
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
        </Fragment>
      ))}
    </div>
  );
};
