import nodemailer from "nodemailer";
import Email from "email-templates";
import path from "path";

import { environmentConfiguration } from "../../../config";

const { sendGrid } = environmentConfiguration;

const EMAIL_VIEWS_PATH = path.join(__dirname, "..", "..", "views");
const EMAIL_VIEWS_TEMPLATES_PATH = path.join(EMAIL_VIEWS_PATH, "templates");
const EMAIL_VIEWS_ASSETS_PATH = path.join(EMAIL_VIEWS_PATH, "assets");
const EMAIL_PREVIEW_OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "emailPreviews"
);

// create reusable transporter object using the SendGrid SMTP transport
const transporter = nodemailer.createTransport({
  host: sendGrid.address,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: sendGrid.username,
    pass: sendGrid.password,
  },
});

export const Emailer = new Email({
  message: {
    from: sendGrid.email,
  },
  send: true,
  transport: transporter,
  preview: {
    open: {
      app: "chrome",
      wait: false,
    },
    dir: EMAIL_PREVIEW_OUTPUT_PATH,
  },
  views: {
    root: EMAIL_VIEWS_TEMPLATES_PATH,
    options: {
      extension: "ejs",
    },
  },

  // Settings related to assets configuration
  juice: true,
  juiceResources: {
    webResources: {
      relativeTo: EMAIL_VIEWS_ASSETS_PATH,
      images: true,
    },
  },
});
