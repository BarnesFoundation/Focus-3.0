import { Emailer } from "./config";
import { TemplatesType } from "./types";

interface SendArguments {
  subject?: string;
  to: string;
  template: TemplatesType;
  locals: JSON | any;
}

export default class MailService {
  /** Performs sending of the provided email contents to the desired address */
  public static async send({ to, template, locals }: SendArguments) {
    try {
      const sendEmailResponse = await Emailer.send({
        template,
        message: {
          to,
        },
        locals,
      });

      console.log("Successfully sent email ", sendEmailResponse);
    } catch (error) {
      console.error(`An error occurred sending email`, error);
    }
  }
}
