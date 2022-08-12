import nodemailer from "nodemailer";
import Email from "email-templates";

import { environmentConfiguration } from "../../config";
import path from "path";

const { sendGrid } = environmentConfiguration;

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

const email = new Email({
  message: {
    from: "cjativa@barnesfoundation.org",
  },
  send: true,
  transport: transporter,
  preview: {
    open: {
      app: "chrome",
      wait: false,
    },
    dir: path.join(__dirname, "..", "..", "..", "..", "emailPreviews"),
  },
});

export default class MailService {
  /** Performs sending of the provided email contents to the desired address */
  public static async send({ subject, to, text, html }: SendArguments) {
    try {
      /* const sendMailResponse = await transporter.sendMail({
        // TODO - this email address will eventually have to be pulled from the tenant configuration
        from: sendGrid.email,
        to,
        subject,
        text,
        html,
      }); */
      const sendEmailResponse = await email.send({
        message: {
          to: "cjativa@barnesfoundation.org",
          subject: "Some subject",
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
