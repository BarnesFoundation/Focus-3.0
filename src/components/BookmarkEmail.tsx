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
import barnesRedLogo from "../images/mailer/barnes_email_logo_red.png";

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
    <div>
      <div className="email__hero-banner">
        <a href="https://barnesfoundation.org" target="_blank" rel="noreferrer">
          <img
            src={barnesLogo}
            alt="barnes_logo"
            className="email__hero-banner__logo"
            role="img"
            aria-label="Welcome to the Barnes Focus Digital Guide"
          />
        </a>
        <div className="email__hero-banner__header-wrapper">
          <h1 className="email__hero-banner__header">
            Thank you for visiting the Barnes today!
          </h1>
        </div>
        <div className="email__hero-banner__image-wrapper">
          <img
            className="email__hero-banner__image"
            src={bannerImage}
            alt="Thank you for visiting the Barnes today"
          />
          <div className="email__hero-banner__image-overlay"></div>
        </div>
      </div>
      <table
        border={0}
        // cellpadding="0"
        // cellspacing="0"
        width="80%"
        style={{ border: "1px solid #eeeeee" }}
        // height="100%"
        className="wrapper"
      >
        <tr>
          <td>
            <div
            // align="center"
            >
              <table
                border={0}
                // cellpadding="0"
                // cellspacing="0"
                width="80%"
                // height="100%"
                className="main-container"
              >
                <tr>
                  <td>
                    {/* Top Logo and social icons */}
                    <table
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{ width: "100%" }}
                    >
                      <tr>
                        <td>
                          <p style={{ padding: "20px 0" }}>&nbsp;</p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ borderTop: "1px solid #eeeeee" }}></td>
                      </tr>
                    </table>

                    <table
                      dir="ltr"
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{ width: "100%" }}
                      className="logos"
                    >
                      <tr>
                        <td
                          width="50%"
                          dir="ltr"
                          className="w100 text-center logos__barnes-logo"
                          style={{ textAlign: "left", padding: "20px 0" }}
                        >
                          <a
                            href="https://collection.barnesfoundation.org"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={barnesRedLogo}
                              alt="Barnes"
                              width="200px"
                            />
                          </a>
                        </td>
                        <td
                          width="50%"
                          dir="ltr"
                          className="w100 text-center logos__social-icons"
                          style={{ textAlign: "right" }}
                        >
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
                        </td>
                      </tr>
                      <tr>
                        <td
                          // colspan="2"
                          style={{ borderTop: "1px solid #eeeeee" }}
                        ></td>
                      </tr>
                    </table>

                    {/* Welcome and bookmark message */}
                    <table
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{ width: "100%" }}
                    >
                      <tr>
                        <td
                          align="left"
                          style={{ textAlign: "left", padding: "20px 0" }}
                        >
                          <p
                            className="header"
                            style={{
                              fontSize: "40px",
                              margin: "10px 0",
                              color: "#282828",
                            }}
                          >
                            {translations &&
                              translations["text_1"]["translated_content"]}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td
                          align="left"
                          style={{ textAlign: "left", padding: "20px 0" }}
                        >
                          <p
                            style={{
                              fontSize: "22px",
                              color: "#b6b6b6",
                              margin: "10px 0",
                            }}
                          >
                            {translations &&
                              translations["text_2"]["translated_content"]}
                          </p>
                          <p
                            style={{
                              fontSize: "22px",
                              color: "#b6b6b6",
                              margin: "10px 0",
                            }}
                          >
                            Get more art in your inbox.{" "}
                            <a href="http://www.pages03.net/thebarnesfoundation/EmailPreferences/curate_your_inbox">
                              Sign up for Barnes emails
                            </a>{" "}
                            to stay on top of special offers and happenings all
                            year round.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ borderTop: "1px solid #eeeeee" }}></td>
                      </tr>
                    </table>

                    {/* Bookmarks */}
                    <table
                      dir="ltr"
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{
                        width: "100%",
                        maxWidth: "800px",
                        color: "#282828",
                        fontSize: "18px",
                      }}
                      className="bookmarks-table"
                    >
                      {/* <% els_arr.forEach((bookmark) => { %> */}
                      {bookmarks &&
                        bookmarks.map((bookmark, index) => (
                          <Fragment key={index}>
                            <tr>
                              <td
                                width="30%"
                                dir="ltr"
                                className="w100 spacer"
                                style={{
                                  color: "#282828",
                                  verticalAlign: "top",
                                  padding: "40px 0",
                                }}
                              >
                                <img
                                  src={`https://barnes-images.imgix.net/${bookmark.id.toString()}_${bookmark.imageSecret.toString()}_n.jpg?crop=faces,entropy&fit=crop&w=200&h=200`}
                                  alt={bookmark.id.toString()}
                                />
                              </td>

                              <td
                                width="65%"
                                dir="ltr"
                                className="w100"
                                style={{
                                  color: "#282828",
                                  verticalAlign: "top",
                                  padding: "18px 0 40px 0",
                                }}
                              >
                                <p>
                                  <a
                                    href={`https://collection.barnesfoundation.org/objects/${bookmark.id.toString()}/${
                                      bookmark.title
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
                                    {["1", "3"].includes(
                                      bookmark["objRightsTypeID"]
                                    ) ? (
                                      <Fragment>
                                        In Copyright. <br />
                                        {bookmark["creditLine"]}
                                      </Fragment>
                                    ) : ["4", "8", "10"].includes(
                                        bookmark["objRightsTypeID"]
                                      ) ? (
                                      <Fragment>Public domain.</Fragment>
                                    ) : ["2", "6"].includes(
                                        bookmark["objRightsTypeID"]
                                      ) ? (
                                      <Fragment>
                                        Copyright Undetermined.
                                      </Fragment>
                                    ) : (
                                      <Fragment></Fragment>
                                    )}
                                  </p>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td
                                // colspan="2"
                                style={{ borderTop: "1px solid #eeeeee" }}
                              ></td>
                            </tr>
                          </Fragment>
                        ))}
                    </table>

                    {/* Footer Spacer */}
                    <table
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{ width: "100%" }}
                    >
                      <tr>
                        <td>
                          <p>&nbsp;</p>
                        </td>
                      </tr>
                    </table>

                    {/* Footer Social Icons */}
                    <table
                      dir="ltr"
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{ width: "100%" }}
                      className="logos"
                    >
                      <tr>
                        <td
                          width="50%"
                          dir="ltr"
                          className="w100 text-center logos__social-icons"
                          style={{ textAlign: "right" }}
                        >
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
                        </td>
                      </tr>
                      <tr>
                        <td
                          // colspan="2"
                          style={{ borderTop: "1px solid #eeeeee" }}
                        ></td>
                      </tr>
                    </table>

                    {/* Footer links */}
                    <div
                    // align="center"
                    >
                      <table
                        dir="ltr"
                        // cellpadding="0"
                        // cellspacing="0"
                        border={0}
                        style={{ width: "60%", tableLayout: "fixed" }}
                        className="footer-action"
                      >
                        <tr style={{ padding: "0 40px" }}>
                          <td
                            dir="ltr"
                            className="w100"
                            style={{
                              width: "20%",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <h3>
                              <a
                                href="https://www.barnesfoundation.org/whats-on/collection"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Visit
                              </a>
                            </h3>
                          </td>
                          <td
                            dir="ltr"
                            className="w100 p20"
                            style={{
                              width: "20%",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <h3>
                              <a
                                href="https://www.barnesfoundation.org/whats-on/talks"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Tour
                              </a>
                            </h3>
                          </td>
                          <td
                            dir="ltr"
                            className="w100 p20"
                            style={{
                              width: "20%",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <h3>
                              <a
                                href="https://www.barnesfoundation.org/support"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Join
                              </a>
                            </h3>
                          </td>
                          <td
                            dir="ltr"
                            className="w100 p20"
                            style={{
                              width: "20%",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <h3>
                              <a
                                href="https://shop.barnesfoundation.org/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Shop
                              </a>
                            </h3>
                          </td>
                          <td
                            dir="ltr"
                            className="w100 p20"
                            style={{
                              width: "20%",
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <h3>
                              <a
                                href="https://www.pages03.net/thebarnesfoundation/EmailPreferences/curate_your_inbox"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Subscribe
                              </a>
                            </h3>
                          </td>
                        </tr>
                      </table>
                    </div>

                    {/* Footer address | Contact etc */}
                    <div
                    // align="center"
                    >
                      <table
                        // cellpadding="0"
                        // cellspacing="0"
                        border={0}
                        style={{ width: "60%", tableLayout: "fixed" }}
                        className="footer-info"
                      >
                        <tr>
                          <td
                            style={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              paddingTop: "10px",
                            }}
                          >
                            <div style={{ height: "28px", color: "#b8b8b8" }}>
                              2025 Benjamin Franklin Parkway, Philadelphia, PA
                              19130
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              paddingTop: "10px",
                            }}
                          >
                            <div style={{ height: "28px", color: "#b8b8b8" }}>
                              <a href="tel:215-278-7000">Call : 215.278.7000</a>
                              &nbsp;&nbsp;&nbsp;mailto:
                              info@barnesfoundation.org
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              paddingTop: "10px",
                            }}
                            className="footer-info-actions"
                          >
                            <div style={{ height: "28px", color: "#b8b8b8" }}>
                              <a
                                href="https://www.barnesfoundation.org/privacy-policy"
                                style={{ textDecoration: "underline" }}
                              >
                                Privacy Policy
                              </a>
                              &nbsp;&nbsp;|&nbsp;&nbsp;
                              <a
                                href="http://www.pages03.net/thebarnesfoundation/EmailPreferences/curate_your_inbox"
                                style={{ textDecoration: "underline" }}
                              >
                                Email Preferences
                              </a>
                              &nbsp;&nbsp;|&nbsp;&nbsp;
                              <a
                                href="http://www.pages03.net/thebarnesfoundation/EmailPreferences/opt-out"
                                style={{ textDecoration: "underline" }}
                              >
                                Unsubscribe
                              </a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    {/* Footer spacer */}
                    <table
                      // cellpadding="0"
                      // cellspacing="0"
                      border={0}
                      style={{ width: "100%" }}
                    >
                      <tr>
                        <td>
                          <p>&nbsp;</p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ borderTop: "1px solid #eeeeee" }}></td>
                      </tr>
                    </table>

                    {/* Footer spacer */}
                    <table
                      // cellPadding="0"
                      // cellSpacing="0"
                      border={0}
                      style={{ width: "100%" }}
                    >
                      <tr>
                        <td>
                          <p>&nbsp;</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>
  );
};
