import React, { useContext } from "react";
import ReactModal from "react-modal";
import { TranslationContext } from "../contexts/TranslationContext";

type UnsupportedDialogueProps = {
  unsupportedIOSBrowser?: boolean;
  unsupportedIOSVersion?: boolean;
};

export const UnsupportedDialogue: React.FC<UnsupportedDialogueProps> = ({
  unsupportedIOSBrowser = false,
  unsupportedIOSVersion = false,
}) => {
  const { getTranslation } = useContext(TranslationContext);
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
