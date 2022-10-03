import React from "react";
import ReactModal from "react-modal";
import withTranslation, { WithTranslationState } from "./withTranslation";

export type UnsupportedDialogueProps = {
  unsupportedIOSBrowser?: boolean;
  unsupportedIOSVersion?: boolean;
} & WithTranslationState;

export const UnsupportedDialogueComponent: React.FC<
  UnsupportedDialogueProps
> = ({
  unsupportedIOSBrowser = false,
  unsupportedIOSVersion = false,
  getTranslation,
}) => {
  const text = unsupportedIOSBrowser
    ? "text_1"
    : unsupportedIOSVersion
    ? "text_2"
    : "";

  return (
    (unsupportedIOSBrowser || unsupportedIOSVersion) && (
      <ReactModal isOpen={true} className="Modal">
        <div className="browser-modal">
          <div className="safari-text h2">
            {getTranslation("UnSupported_OS_Browser_Screen", text)}
          </div>
        </div>
      </ReactModal>
    )
  );
};

export const UnsupportedDialogue = withTranslation<UnsupportedDialogueProps>(
  UnsupportedDialogueComponent
);
