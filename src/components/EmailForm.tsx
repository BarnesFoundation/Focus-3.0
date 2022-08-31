// TODO - figure out if we really want to bring in this whole lodash module
import throttle from "lodash.throttle";
import React, { Component } from "react";
import { withRouter } from "react-router";
import {
  SNAP_LANGUAGE_PREFERENCE,
  SNAP_USER_EMAIL,
  TOP_OFFSET,
  VIEWPORT_HEIGHT,
} from "./Constants";
import { SearchRequestService } from "../services/SearchRequestService";
import { ScanButton } from "./ScanButton";
import { isAndroid } from "react-device-detect";
import { EmailFormInput } from "./EmailFormInput";

const withStoryStyles = {
  backgroundColor: "#fff",
  color: "#353535",
};

class EmailForm extends Component {
  constructor(props) {
    super(props);
    this.sr = new SearchRequestService();
    this.state = {
      email: "",
      floatScanBtn: false,
      emailCaptured: false,
      varificationPending: null,
      errors: {
        email: false,
      },
    };
  }

  componentDidMount() {
    //console.log('EmailForm >> componentDidMount');
    this.scrollInProgress = false;
    // Register scroll listener
    window.addEventListener("scroll", this._onScroll, true);
  }

  componentWillUnmount() {
    // Un-register scroll listener
    window.removeEventListener("scroll", this._onScroll);
  }

  /**
   * All the fancy scroll animation goes here.
   */
  handleScroll = () => {
    if (!this.emailRef) {
      this.scrollInProgress = false;
      return;
    }
    const emailFormTop = this.emailRef.getBoundingClientRect().top;

    const floating =
      emailFormTop <= TOP_OFFSET * VIEWPORT_HEIGHT ? true : false;

    if (this.state.floatScanBtn !== floating) {
      this.setState({ floatScanBtn: floating });
    }

    this.scrollInProgress = false;
  };

  _onScroll = (event) => {
    if (!this.scrollInProgress) {
      requestAnimationFrame(throttle(this.handleScroll, 100));
      this.scrollInProgress = true;
    }
  };

  handleEmailInput = (event) => {
    event.preventDefault();
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  validateEmail = async () => {
    const validated = await this.sr.validteEmail(this.state.email);

    this.setState({ varificationPending: false });
    return this.state.email.length > 0 && validated === true;
  };

  _saveEmail = async () => {
    this.setState({ varificationPending: true });
    // Get whether or not the email is valid
    const emailIsValid = await this.validateEmail();

    // If email is not valid
    if (!emailIsValid) {
      this.setState({ varificationPending: false });
      this.setState({ errors: { email: true } });
    }

    // Otherwise, it is valid
    else {
      console.log("Valid email. Call backend API to save email.");
      this.setState({ varificationPending: false });
      const userEmail = this.state.email;
      this.setState({ email: "", emailCaptured: true });
      localStorage.setItem(SNAP_USER_EMAIL, userEmail);
      this.props.onSubmitEmail(userEmail);
    }
  };

  setEmailRef = (elem) => {
    if (elem) {
      this.emailRef = elem;
      //console.log('Email Form height = ' + this.emailRef.getBoundingClientRect().height);
      const emailFormHeight = this.emailRef.getBoundingClientRect().height;
      this.props.getSize(emailFormHeight);
    }
  };

  renderEmailSuccess = () => {
    const intentStyle = this.props.withStory ? { color: `#F74E32` } : {};
    return (
      <div>
        <div className="email-intent" style={intentStyle}>
          Thank You
        </div>
        <div className="email-head">
          {this.props.getTranslation("Bookmark_capture", "text_4")}
        </div>
      </div>
    );
  };

  render() {
    const { floatScanBtn, emailCaptured } = this.state;
    const { history } = this.props;
    const peekOffset = isAndroid ? 123 : 67;

    return (
      <div
        id="email-form"
        className="email-container"
        style={
          this.props.withStory ? withStoryStyles : { top: `-${peekOffset}px` }
        }
        ref={this.setEmailRef}
      >
        {/* Render the scan button and whether or not it should float */}
        <ScanButton history={history} float={floatScanBtn} />

        {/* Render the email form based on whether or not captured/success */}
        {!emailCaptured && (
          <EmailFormInput
            getTranslation={this.props.getTranslation}
            isEmailScreen={this.props.isEmailScreen}
            withStory={this.props.withStory}
            error={this.state.errors.email}
            email={this.state.email}
            handleEmailInput={this.handleEmailInput}
            saveEmail={this._saveEmail}
            verificationPending={this.state.varificationPending}
          />
        )}
        {emailCaptured && this.renderEmailSuccess()}
      </div>
    );
  }
}

export default withRouter(EmailForm);
