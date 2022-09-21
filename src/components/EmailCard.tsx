import React, { Fragment } from "react";
import { Controller, Scene } from "react-scrollmagic";
import { isAndroid } from "react-device-detect";

import { EmailForm } from "./EmailForm";

type EmailCardProps = {
  artworkScrollOffset: number;
  emailCardClickable: boolean;
  onSubmitEmail: (email: string) => void;
  onEmailHeightReady: (height: any) => void;
  handleClickScroll: () => void;
  getTranslation: (screen: string, textId: string) => string;
};

export const EmailCard: React.FC<EmailCardProps> = ({
  artworkScrollOffset,
  emailCardClickable,
  onSubmitEmail,
  onEmailHeightReady,
  handleClickScroll,
  getTranslation,
}) => {
  // Props for the controller, add container prop for Android
  const controllerProps = { refreshInterval: 250 };
  if (isAndroid) {
    controllerProps["container"] = ".sm-container";
  }

  const duration = screen.height < 800 ? 800 : screen.height;
  const offsetDuration = duration + artworkScrollOffset - 150;

  return (
    <Fragment>
      <Controller {...controllerProps}>
        <Scene
          loglevel={0}
          /** There is something weird going on with react-scrollmagic types that
           * keeps giving us an error, but we can't change this component or update
           * the dependency or else it breaks!
           */
          // @ts-ignore
          pin="#email-panel"
          triggerElement="#email-panel"
          triggerHook="onEnter"
          indicators={false}
          duration={offsetDuration}
          offset="0"
          pinSettings={{
            pushFollowers: true,
            spacerClass: "scrollmagic-pin-spacer-pt",
          }}
        >
          <div id={`story-pin-enter`} />
        </Scene>
      </Controller>

      {/** Placeholder element to control email card enter when no stories are available. Only show when email has not been captured */}
      <div
        id="email-trigger-enter"
        style={{ visibility: "hidden", bottom: 0 }}
      />
      <EmailForm
        withStory={false}
        isEmailScreen={false}
        onSubmitEmail={onSubmitEmail}
        getTranslation={getTranslation}
        getSize={onEmailHeightReady}
        pointerEvents={emailCardClickable ? "auto" : "none"}
        handleClickScroll={handleClickScroll}
      />
    </Fragment>
  );
};
