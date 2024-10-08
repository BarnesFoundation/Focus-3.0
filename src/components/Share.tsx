import React, { useState } from "react";

import { Popover, PopoverBody } from "reactstrap";
import shareButton from "../images/share-icon.svg";
import * as constants from "../constants";
import { ArtworkObject } from "../types/payloadTypes";

export type ShareProps = {
  artwork: ArtworkObject;
  shareText: string;
};

export const Share: React.FC<ShareProps> = ({ artwork, shareText }) => {
  const [sharePopoverIsOpen, setSharePopoverIsOpen] = useState(false);

  /** Generates the shareable text items. The title, titleAuthorLine, hashtags list, and url */
  const generateShareableText = () => {
    const { artist, title, id } = artwork;

    const url = `https://collection.barnesfoundation.org/objects/${id}`;
    const bTitle = `Barnes Foundation`;

    const hashtags = ["BarnesFocus", "SeeingTheBarnes"];
    let titleAuthorLine = title;

    // If the artist exists and isn't unidentified
    if (artist && !artist.toLowerCase().includes("unidentified")) {
      titleAuthorLine += ` by ${artist}`;
      hashtags.push(`${artist.split(" ").join("").split("-").join("")}`);
    }

    return { bTitle, titleAuthorLine, hashtags, url };
  };

  /** Handles sharing click, attempts to use native sharing. Otherwise, opens the share modal */
  const onClickShare = async () => {
    // For mobile devices where native share is available
    if (navigator.share) {
      const { bTitle, titleAuthorLine, hashtags, url } =
        generateShareableText();

      // Generate the text line by adding the # in front of each hashtag
      let text = `${titleAuthorLine}`;
      hashtags.forEach((tag) => {
        text += ` #${tag}`;
      });

      try {
        await navigator.share({ title: bTitle, text, url });
      } catch (error) {
        console.log(`An error occurred during sharing`, error);
      }
    }

    // Otherwise, normal share modal
    else {
      toggleShareModal();
    }
  };

  /** Toggles display of the share modal */
  const toggleShareModal = () => {
    setSharePopoverIsOpen(!sharePopoverIsOpen);
  };

  const fbUrl = `https://collection.barnesfoundation.org/objects/${artwork.id}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    fbUrl
  )}`;

  /* Fallback for sharing functionality when native sharing is not available. Opens the web intent in a new window */
  const shareWebFallback = (e) => {
    const socialMediaType = e.currentTarget.dataset.id;
    setSharePopoverIsOpen(false);

    let appUriScheme;
    let webFallbackURL;

    switch (socialMediaType) {
      case constants.SOCIAL_MEDIA_TWITTER: {
        const { bTitle, titleAuthorLine, hashtags, url } =
          generateShareableText();

        // Join the line with '+' for the url
        const text = titleAuthorLine.split(" ").join("+");
        const via = `the_barnes`;

        //urlToShare += '?utm_source=barnes_snap&utm_medium=twitter&utm_term=' + this.state.artwork.id;
        //appUriScheme = 'twitter://post?&text=' + title_author + '&url=' + urlToShare + '&hashtags=' + hashtag;

        webFallbackURL = `https://twitter.com/intent/tweet?&text=${text}&via=${via}&url=${url}&hashtags=${hashtags.join()}`;

        window.open(webFallbackURL, "_blank");
        break;
      }
    }
    e.preventDefault();
  };

  return (
    <div>
      {/* Share button */}
      <div id="share-it" className="btn-share-result" onClick={onClickShare}>
        <img src={shareButton} alt="share" />
        <span className="text-share">{shareText}</span>
      </div>

      {/* Share popup that displays upon share button click when native sharing isn't available */}
      <Popover placement="top" isOpen={sharePopoverIsOpen} target="share-it">
        <PopoverBody>
          <div className="share">
            <a
              data-id={constants.SOCIAL_MEDIA_TWITTER}
              onClick={shareWebFallback}
            >
              <i className="fa fa-lg fa-twitter" aria-hidden="true" />
            </a>
            <a
              target="_blank"
              href={facebookShareUrl}
              data-id={constants.SOCIAL_MEDIA_FACEBOOK}
              rel="noreferrer"
            >
              <i className="fa fa-lg fa-facebook" aria-hidden="true" />
            </a>
          </div>
        </PopoverBody>
      </Popover>
    </div>
  );
};
