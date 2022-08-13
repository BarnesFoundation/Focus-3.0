import nodemailer from "nodemailer";
import EmailTemplates from "email-templates";
import path from "path";

import { environmentConfiguration } from "../../../config";

const { sendGrid } = environmentConfiguration;

const EMAIL_PREVIEW_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "emailPreviews"
);
const EMAIL_VIEWS_PATH = path.join(__dirname, "..", "..", "views");

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
console.log("the email path", EMAIL_VIEWS_PATH);
export const Emailer = new EmailTemplates({
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
    dir: EMAIL_PREVIEW_PATH,
  },
  views: {
    root: EMAIL_VIEWS_PATH,
    options: {
      extension: "ejs",
    },
  },
});
