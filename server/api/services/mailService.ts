import nodemailer from "nodemailer";
import EmailTemplates from "email-templates";
import path from "path";

import { environmentConfiguration } from "../../config";

const { sendGrid } = environmentConfiguration;
const EMAIL_PREVIEWS_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "emailPreviews"
);

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: sendGrid.address,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: sendGrid.username,
    pass: sendGrid.password,
  },
});

interface SendArguments {
  subject: string;
  to: string;
  text: string;
  html: string;
}

const Emailer = new EmailTemplates({
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
    dir: EMAIL_PREVIEWS_PATH,
  },
});

export default class MailService {
  /** Performs sending of the provided email contents to the desired address */
  public static async send({ subject, to, text, html }: SendArguments) {
    try {
      const sendEmailResponse = await Emailer.send({
        message: {
          to,
          subject,
          html: "<p>Hello, a test!</p>",
          text: "Hello, a test!",
        },
      });

      console.log("Successfully sent email ", sendEmailResponse);
    } catch (error) {
      console.log(`An error occurred sending email`, error);
    }
  }
}
