import { SendMailOptions } from "nodemailer";
import GenerateMessage from './generateMessage';

export default function generateOptions<T extends string>(
  emails: string,
  template: string,
  keys: Record<T, any>
): SendMailOptions {
  const message: string = GenerateMessage(template, keys);

  const options: SendMailOptions = {
    to: emails,
    subject: "AutoDrop Customer Support",
    html: message,
  };

  return options;
}
