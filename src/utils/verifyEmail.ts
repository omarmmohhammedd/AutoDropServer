import nodemailer from "nodemailer";
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export async function sendVerificationCode(email: string, code: string) {
  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NodeMailerEmail,
      pass: process.env.NodeMailerPass,
    },
  });

  const mailOptions = {
    from: "support@autodrop.me",
    to: email,
    subject: "Verification Code",
    text: `Your verification code is ${code}`,
    html: `
      <style>
        .email-content {
          font-family: Arial, sans-serif;
        }
        .email-content h1 {
          color: #333;
        }
        .email-content p {
          color: #666;
        }
        .code {
          font-weight: bold;
          color: #f00;
        }
      </style>
      <div class="email-content">
        <h1>Welcome to AutoDrop!</h1>
        <p>Your verification code is: <span class="code">${code}</span></p>
        <p>Please enter this code to verify your email address.</p>
        <p>Thank you.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
