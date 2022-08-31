// TODO - figure out if we really want to bring in this whole lodash module
import throttle from "lodash.throttle";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import classnames from "classnames";
import { SNAP_USER_EMAIL, TOP_OFFSET, VIEWPORT_HEIGHT } from "./Constants";
import { SearchRequestService } from "../services/SearchRequestService";
import { ScanButton } from "./ScanButton";
import { isAndroid } from "react-device-detect";
import { EmailFormInput } from "./EmailFormInput";
import { useLocalStorage } from "../hooks/useLocalStorage";

const withStoryStyles = {
  backgroundColor: "#fff",
  color: "#353535",
};

type EmailFormProps = {
  withStory: any;
  onSubmitEmail: (args: any) => any;
  getSize: (args: any) => any;
  getTranslation: any;
  isEmailScreen: any;
};

export const EmailForm: React.FC<EmailFormProps> = ({
  withStory,
  onSubmitEmail,
  getSize,
  getTranslation,
  isEmailScreen,
}) => {
  const sr = new SearchRequestService();
  const [email, setEmail] = useState("");
  const [floatScanBtn, setFloatScanBtn] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [verificationPending, setVerificationPending] = useState(null);
  const [errors, setErrors] = useState({ email: false });
  const [scrollInProgress, setScrollInProgress] = useState(false);
  const { history } = useHistory();
  const { setLocalStorage } = useLocalStorage();
  const emailRef: React.Ref<HTMLDivElement> = useRef(null);
  const peekOffset = isAndroid ? 123 : 67;

  useEffect(() => {
    console.log("EmailForm >> componentDidMount");
    // Register scroll listener
    window.addEventListener("scroll", onScroll, true);

    // Un-register scroll listener
    return function cleanup() {
      window.removeEventListener("scroll", onScroll);
    };
  });

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

    const floating =
      emailFormTop <= TOP_OFFSET * VIEWPORT_HEIGHT ? true : false;

    if (floatScanBtn !== floating) {
      setFloatScanBtn(floating);
    }

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
    const valid = await sr.validateEmail(email);
    setVerificationPending(false);

    return email.length > 0 && valid;
  };

  const saveEmail = async () => {
    setVerificationPending(true);

    try {
      // Get whether or not the email is valid
      const emailIsValid = await validateEmail();

      // If email is not valid
      if (!emailIsValid) {
        setErrors({ ...errors, email: true });
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
      throw e;
    } finally {
      setVerificationPending(false);
    }
  };

  return (
    <div
      id="email-form"
      className="email-container"
      style={withStory ? withStoryStyles : { top: `-${peekOffset}px` }}
      ref={emailRef}
    >
      {/* Render the scan button and whether or not it should float */}
      <ScanButton history={history} float={floatScanBtn} />

      {/* Render the email form based on whether or not captured/success */}
      {!emailCaptured && (
        <EmailFormInput
          getTranslation={getTranslation}
          isEmailScreen={isEmailScreen}
          withStory={withStory}
          error={errors.email}
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
  );
};
