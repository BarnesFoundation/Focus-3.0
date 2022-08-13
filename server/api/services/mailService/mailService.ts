import { Emailer } from "./config";
import { TemplatesType } from "./types";

interface SendArguments {
  subject: string;
  to: string;
  template: TemplatesType;
  locals: JSON;
}

export default class MailService {
  /** Performs sending of the provided email contents to the desired address */
  public static async send({ subject, to, template }: SendArguments) {
    try {
      const sendEmailResponse = await Emailer.send({
        template,
        message: {
          to,
          subject,
        },
        locals: {
          name: "Christopher",
        },
      });

      console.log("Successfully sent email ", sendEmailResponse);
    } catch (error) {
      console.error(`An error occurred sending email`, error);
    }
  }
}
