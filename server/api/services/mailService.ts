import nodemailer from "nodemailer";

import { environmentConfiguration } from "../../config";

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

export default class MailService {
  /** Performs sending of the provided email contents to the desired address */
  public static async send({ subject, to, text, html }: SendArguments) {
    try {
      const sendMailResponse = await transporter.sendMail({
        // TODO - this email address will eventually have to be pulled from the tenant configuration
        from: sendGrid.email,
        to,
        subject,
        text,
        html,
      });

      console.log("Successfully sent email ", sendMailResponse.messageId);
    } catch (error) {
      console.log(`An error occurred sending email`, error);
    }
  }
}
