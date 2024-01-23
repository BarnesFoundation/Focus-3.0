import React, { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchRequestService } from "../services/SearchRequestService";
import bannerImage from "../images/barnes-v2-landing.png";
import barnesLogo from "../images/Barnes_logo.svg";
import facebookLogo from "../images/mailer/social_facebook.png";
import instagramLogo from "../images/mailer/social_instagram.png";
import linkedinLogo from "../images/mailer/social_linkedin.png";
import twitterLogo from "../images/mailer/social_twitter.png";
import youtubeLogo from "../images/mailer/social_youtube.png";

export const BookmarkEmail: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>();
  const [translations, setTranslations] = useState();
  const location = useLocation();
  const sr = new SearchRequestService();

  useEffect(() => {
    const [_, _email, _type, sessionId] = location.pathname.split("/");
    const fetchBookmarkEmailData = async () => {
      const data = await sr.getBookmarkEmail(sessionId);
      console.log(data);
      setBookmarks(data.bookmarkArtworkList);
      setTranslations(data.translations);
    };

    fetchBookmarkEmailData();
  }, []);

  return (
    <div className="email">
      {/* Hero banner header */}
      <div className="email__hero-banner">
        <div className="email__hero-banner__content">
          {/* Logo and social icons */}
          <div className="email__hero-banner__content__row">
            <a
              href="https://collection.barnesfoundation.org"
              target="_blank"
              rel="noreferrer"
              className="email__hero-banner__social__item"
            >
              <img
                src={barnesLogo}
                alt="barnes_logo"
                className="email__hero-banner__logo"
                role="img"
                aria-label="Welcome to the Barnes Focus Digital Guide"
              />
            </a>
            <div className="email__hero-banner__social">
              <a
                href="https://www.facebook.com/barnesfoundation/"
                target="_blank"
                rel="noreferrer"
                className="email__hero-banner__social__item"
              >
                <img
                  src={facebookLogo}
                  alt="facebook"
                  width="20px"
                  height="20px"
                  style={{ padding: "20px 10px; opacity: 0.8" }}
                />
              </a>
              <a
                href="https://www.instagram.com/barnesfoundation/"
                target="_blank"
                rel="noreferrer"
                className="email__hero-banner__social__item"
              >
                <img
                  src={instagramLogo}
                  alt="instagram"
                  width="20px"
                  height="20px"
                  style={{ padding: "20px 10px; opacity: 0.8" }}
                />
              </a>
              <a
                href="https://www.linkedin.com/company/barnes-foundation"
                target="_blank"
                rel="noreferrer"
                className="email__hero-banner__social__item"
              >
                <img
                  src={linkedinLogo}
                  alt="linkedin"
                  width="20px"
                  height="20px"
                  style={{ padding: "20px 10px; opacity: 0.8" }}
                />
              </a>
              <a
                href="https://twitter.com/the_barnes"
                target="_blank"
                rel="noreferrer"
                className="email__hero-banner__social__item"
              >
                <img
                  src={twitterLogo}
                  alt="twitter"
                  width="20px"
                  height="20px"
                  style={{ padding: "20px 10px; opacity: 0.8" }}
                />
              </a>
              <a
                href="https://www.youtube.com/user/BarnesFoundation"
                target="_blank"
                rel="noreferrer"
                className="email__hero-banner__social__item"
              >
                <img
                  src={youtubeLogo}
                  alt="Youtube"
                  width="20px"
                  height="20px"
                  style={{ padding: "20px 10px; opacity: 0.8" }}
                />
              </a>
            </div>
          </div>

          {/* Email subject */}
          <div className="email__hero-banner__header">
            <h1 className="email__hero-banner__header__h1">
              Thank you for visiting the Barnes today!
            </h1>
          </div>
        </div>

        <div className="email__hero-banner__image">
          <img
            className="email__hero-banner__image__content"
            src={bannerImage}
            alt="Thank you for visiting the Barnes today"
          />
          <div className="email__hero-banner__image__overlay"></div>
        </div>
      </div>

      {/* Email content */}
      <div className="email__content">
        {/* Welcome and bookmark message */}
        <div className="email__content__message bottom-border">
          <h2 className="email__content__message__header">
            {translations && translations["text_1"]["translated_content"]}
          </h2>
          <p className="email__content__message__text">
            {translations && translations["text_2"]["translated_content"]}
          </p>
          <p className="email__content__message__text">
            Get more art in your inbox.{" "}
            <a href="http://www.pages03.net/thebarnesfoundation/EmailPreferences/curate_your_inbox">
              Sign up for Barnes emails
            </a>{" "}
            to stay on top of special offers and happenings all year round.
          </p>
        </div>

        {/* Bookmarks */}
        <div className="email__content__bookmarks">
          {bookmarks &&
            bookmarks.map((bookmark, index) => (
              <div
                key={index}
                className="email__content__bookmarks__item bottom-border"
              >
                <img
                  src={`https://barnes-images.imgix.net/${bookmark.id.toString()}_${bookmark.imageSecret.toString()}_n.jpg?crop=faces,entropy&fit=crop&w=200&h=200`}
                  alt={bookmark.id.toString()}
                />
                <div className="email__content__bookmarks__item__text">
                  <p>
                    <a
                      href={`https://collection.barnesfoundation.org/objects/${bookmark.id.toString()}/${bookmark.title
                        }?utm_source=focus&utm_medium=email&utm_campaign=focus_scanned_object`}
                      title="Barnes Collection"
                      style={{ color: "#d6421f !important" }}
                    >
                      <h3>{bookmark.title}</h3>
                    </a>
                  </p>
                  {bookmark["people"]}. {bookmark["title"]},
                  {bookmark["displayDate"]}. {bookmark["medium"]},
                  {bookmark["dimensions"]}. {bookmark["invno"]}
                  {bookmark.objRightsTypeID && (
                    <p>
                      {["1", "3"].includes(bookmark["objRightsTypeID"]) ? (
                        <Fragment>
                          In Copyright. <br />
                          {bookmark["creditLine"]}
                        </Fragment>
                      ) : ["4", "8", "10"].includes(
                        bookmark["objRightsTypeID"]
                      ) ? (
                        <Fragment>Public domain.</Fragment>
                      ) : ["2", "6"].includes(bookmark["objRightsTypeID"]) ? (
                        <Fragment>Copyright Undetermined.</Fragment>
                      ) : (
                        <Fragment></Fragment>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Email footer */}
      <div className="email__footer">
        {/* Footer Social Icons */}
        <div className="email__footer__social">
          <a
            href="https://www.facebook.com/barnesfoundation/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={facebookLogo}
              alt="facebook"
              width="20px"
              height="20px"
              style={{ padding: "20px 10px; opacity: 0.8" }}
            />
          </a>
          <a
            href="https://www.instagram.com/barnesfoundation/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={instagramLogo}
              alt="instagram"
              width="20px"
              height="20px"
              style={{ padding: "20px 10px; opacity: 0.8" }}
            />
          </a>
          <a
            href="https://www.linkedin.com/company/barnes-foundation"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={linkedinLogo}
              alt="linkedin"
              width="20px"
              height="20px"
              style={{ padding: "20px 10px; opacity: 0.8" }}
            />
          </a>
          <a
            href="https://twitter.com/the_barnes"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={twitterLogo}
              alt="twitter"
              width="20px"
              height="20px"
              style={{ padding: "20px 10px; opacity: 0.8" }}
            />
          </a>
          <a
            href="https://www.youtube.com/user/BarnesFoundation"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={youtubeLogo}
              alt="Youtube"
              width="20px"
              height="20px"
              style={{ padding: "20px 10px; opacity: 0.8" }}
            />
          </a>
        </div>

        {/* Footer links */}
        <div className="email__footer__links">
          <h3 className="email__footer__links__item">
            <a
              href="https://www.barnesfoundation.org/whats-on/collection"
              target="_blank"
              rel="noreferrer"
            >
              Visit
            </a>
          </h3>
          <h3>
            <a
              href="https://www.barnesfoundation.org/whats-on/talks"
              target="_blank"
              rel="noreferrer"
            >
              Tour
            </a>
          </h3>
          <h3>
            <a
              href="https://www.barnesfoundation.org/support"
              target="_blank"
              rel="noreferrer"
            >
              Join
            </a>
          </h3>
          <h3>
            <a
              href="https://shop.barnesfoundation.org/"
              target="_blank"
              rel="noreferrer"
            >
              Shop
            </a>
          </h3>
          <h3>
            <a
              href="https://www.pages03.net/thebarnesfoundation/EmailPreferences/curate_your_inbox"
              target="_blank"
              rel="noreferrer"
            >
              Subscribe
            </a>
          </h3>
        </div>

        {/* Footer address | Contact etc */}
        <div className="email__footer__contact">
          <div className="email__footer__contact__item">
            2025 Benjamin Franklin Parkway, Philadelphia, PA 19130
          </div>
          <div className="email__footer__contact__item">
            <span className="no-wrap">
              Call: <a href="tel:215-278-7000">215.278.7000</a>
            </span>
            {"  "}|{"  "}
            <span className="no-wrap">
              Email:{" "}
              <a href="mailto:info@barnesfoundation.org">
                info@barnesfoundation.org
              </a>
            </span>
          </div>
          <div className="email__footer__contact__item">
            <span className="no-wrap">
              <a
                href="https://www.barnesfoundation.org/privacy-policy"
                style={{ textDecoration: "underline" }}
              >
                Privacy Policy
              </a>
            </span>
            {"  "}|{"  "}
            <span className="no-wrap">
              <a
                href="http://www.pages03.net/thebarnesfoundation/EmailPreferences/curate_your_inbox"
                style={{ textDecoration: "underline" }}
                className="no-wrap"
              >
                Email Preferences
              </a>
            </span>
            {"  "}|{"  "}
            <span className="no-wrap">
              <a
                href="http://www.pages03.net/thebarnesfoundation/EmailPreferences/opt-out"
                style={{ textDecoration: "underline" }}
              >
                Unsubscribe
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
