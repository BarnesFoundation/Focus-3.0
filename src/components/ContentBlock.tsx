import React, { Fragment } from "react";
import sanitizeHtml from "sanitize-html";
import {
  ContentBlock as ContentBlockType,
  ContentBlockTypes,
} from "../types/payloadTypes";

type ContentBlockProps = {
  contentBlock: ContentBlockType[];
};

export const ContentBlock: React.FC<ContentBlockProps> = ({ contentBlock }) => {
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
            <Fragment>{sanitizeHtml(block.textBlock.html)}</Fragment>
          )}
        </Fragment>
      ))}
    </div>
  );
};
