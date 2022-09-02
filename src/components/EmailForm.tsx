// TODO - figure out if we really want to bring in this whole lodash module
import React, { useEffect, useRef, useState } from "react";
import throttle from "lodash.throttle";
import classnames from "classnames";
import { isAndroid } from "react-device-detect";

import { SNAP_USER_EMAIL, TOP_OFFSET, VIEWPORT_HEIGHT } from "./Constants";
import { SearchRequestService } from "../services/SearchRequestService";
import { ScanButton } from "./ScanButton";
import { EmailFormInput } from "./EmailFormInput";
import { useLocalStorage } from "../hooks/useLocalStorage";

const withStoryStyles = {
  backgroundColor: "#fff",
  color: "#353535",
};

// TODO: Fix types once we figure out what they should be!
type EmailFormProps = {
  withStory: any;
  onSubmitEmail: (email: any) => void;
  getSize: (height: any) => any;
  getTranslation: any;
  isEmailScreen: any;
  pointerEvents: "auto" | "none";
  handleClickScroll: (storyIndex: any, isStoryCard: boolean) => void;
};

export const EmailForm: React.FC<EmailFormProps> = ({
  withStory,
  onSubmitEmail,
  getSize,
  getTranslation,
  isEmailScreen,
  pointerEvents,
  handleClickScroll,
}) => {
  const sr = new SearchRequestService();
  const [email, setEmail] = useState("");
  const [floatScanBtn, setFloatScanBtn] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [error, setError] = useState(false);
  const [scrollInProgress, setScrollInProgress] = useState(false);
  const { setLocalStorage } = useLocalStorage();
  const emailRef: React.Ref<HTMLDivElement> = useRef(null);
  const peekOffsetValue = isAndroid ? 123 : 67;
  const peekOffset = withStory ? 0 : peekOffsetValue;

  useEffect(() => {
    console.log("EmailForm >> componentDidMount");
    // Register scroll listener
    window.addEventListener("scroll", onScroll, true);

    // Un-register scroll listener
    return function cleanup() {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (emailRef.current) {
      const emailFormHeight = emailRef.current.getBoundingClientRect().height;
      getSize(emailFormHeight);
    }
  }, [emailRef, getSize]);

  /**
   * All the fancy scroll animation goes here.
   */
  const handleScroll = () => {
    if (!emailRef.current) {
      setScrollInProgress(false);
      return;
    }
    const emailFormTop = emailRef.current.getBoundingClientRect().top;
    setFloatScanBtn(
      emailFormTop <= TOP_OFFSET * VIEWPORT_HEIGHT ? true : false
    );
    setScrollInProgress(false);
  };

  const onScroll = (event) => {
    if (!scrollInProgress) {
      requestAnimationFrame(throttle(handleScroll, 100));
      setScrollInProgress(true);
    }
  };

  const handleEmailInput = (event) => {
    event.preventDefault();
    setEmail(event.target.value);
  };

  const validateEmail = async () => {
    try {
      const valid = await sr.validateEmail(email);
      setVerificationPending(false);

      return email.length > 0 && valid;
    } catch (e) {
      console.log("Error validating email:", e);
      return false;
    }
  };

  const saveEmail = async () => {
    setVerificationPending(true);

    try {
      // Get whether or not the email is valid
      const emailIsValid = await validateEmail();

      // If email is not valid
      if (!emailIsValid) {
        setError(true);
      }
      // Otherwise, it is valid
      else {
        console.log("Valid email. Call backend API to save email.");
        setEmailCaptured(true);
        // TODO: figure out why they reset email here
        // this.setState({ email: "", emailCaptured: true });
        setLocalStorage(SNAP_USER_EMAIL, email);
        onSubmitEmail(email);
      }
    } catch (e) {
      console.log("Error saving email:", e);
      setError(true);
    } finally {
      setVerificationPending(false);
    }
  };

  return (
    <div
      id="email-panel"
      className="panel-email"
      style={{
        pointerEvents,
        height: `calc(60vh - ${peekOffset}px)`,
      }}
      onClick={() => {
        handleClickScroll(null, false);
      }}
    >
      <div
        id="email-form"
        className="email-container"
        style={withStory ? withStoryStyles : emailCaptured ? {} : { top: `-${peekOffsetValue}px` }}
        ref={emailRef}
      >
        {/* Render the scan button and whether or not it should float */}
        <ScanButton float={floatScanBtn} />

        {/* Render the email form based on whether or not captured/success */}
        {!emailCaptured && (
          <EmailFormInput
            getTranslation={getTranslation}
            isEmailScreen={isEmailScreen}
            withStory={withStory}
            error={error}
            email={email}
            handleEmailInput={handleEmailInput}
            saveEmail={saveEmail}
            verificationPending={verificationPending}
          />
        )}
        {emailCaptured && (
          <div>
            <div
              className={classnames("email-intent", {
                "with-story": withStory,
              })}
            >
              Thank You
            </div>
            <div className="email-head">
              {getTranslation("Bookmark_capture", "text_4")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
