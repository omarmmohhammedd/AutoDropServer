import AppError from '../../utils/appError';
import {
  createTransport,
  Transporter,
  SendMailOptions,
  TransportOptions,
} from "nodemailer";

const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = process.env;

export default async function SendEmail(
  options: SendMailOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      let transporter: Transporter, info: any;
      const emailOptions = {
        host: EMAIL_HOST as string,
        port: EMAIL_PORT,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD,
        },
      } as TransportOptions;

      transporter = createTransport(emailOptions);

      transporter.verify(async function (err: Error | null, success: boolean) {
        if (err) return reject(new AppError("InternalServerError",400));
        info = await transporter.sendMail({
          from: '"Autodrop" <' + EMAIL_USERNAME + ">",
          ...options,
        });

        resolve(info);
      });
    } catch (error) {
      reject(error);
    }
  });
}
