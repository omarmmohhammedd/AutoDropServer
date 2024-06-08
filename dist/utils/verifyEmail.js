"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationCode = exports.generateVerificationCode = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.generateVerificationCode = generateVerificationCode;
function sendVerificationCode(email, code) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail(mailOptions);
    });
}
exports.sendVerificationCode = sendVerificationCode;
