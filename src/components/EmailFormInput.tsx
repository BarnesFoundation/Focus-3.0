import React from "react";
import classnames from "classnames";
import { useLocalStorage } from "../hooks/useLocalStorage";

// TODO: Fix types
type EmailFormInputProps = {
  getTranslation: any;
  isEmailScreen: any;
  withStory: any;
  error: boolean;
  email: string;
  handleEmailInput: (event) => void;
  saveEmail: () => void;
  verificationPending: boolean;
};

export const EmailFormInput: React.FC<EmailFormInputProps> = ({
  getTranslation,
  isEmailScreen,
  withStory,
  error,
  email,
  handleEmailInput,
  saveEmail,
  verificationPending,
}) => {
  const { getLanguagePreference } = useLocalStorage();
  const useSmallText = getLanguagePreference() === "Ru";

  const disclaimerTop =
    isEmailScreen && error
      ? "365px"
      : isEmailScreen && !error
      ? "300px"
      : "0px";

  return (
    <div>
      <div className={classnames("email-intent", { "with-story": withStory })}>
        {getTranslation("Bookmark_capture", "text_8")}
      </div>
      <div className={classnames("email-head", { "small-text": useSmallText })}>
        {getTranslation("Bookmark_capture", "text_1")}
      </div>
      <div className="email-input">
        <form>
          <div className="input-group">
            <input
              type="email"
              placeholder={getTranslation("Bookmark_capture", "text_2")}
              className="form-control"
              name="email"
              value={email}
              onChange={handleEmailInput}
              aria-label="email"
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                id="bookmark-submit"
                type="button"
                onClick={() => saveEmail()}
              >
                {getTranslation("Bookmark_capture", "text_7")}
                {verificationPending && (
                  <div className="loader-container">
                    <div className="loader"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div
              className={classnames("email-input-error", "caption", {
                "small-text": useSmallText,
              })}
            >
              {getTranslation("Bookmark_capture", "text_5")} <br />
              {getTranslation("Bookmark_capture", "text_6")}
            </div>
          )}
        </form>
      </div>
      <div
        className="email-disclaimer small-paragraph"
        style={{ top: disclaimerTop }}
      >
        {getTranslation("Bookmark_capture", "text_3")}
      </div>
    </div>
  );
};
