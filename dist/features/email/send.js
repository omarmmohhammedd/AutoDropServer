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
const appError_1 = __importDefault(require("../../utils/appError"));
const nodemailer_1 = require("nodemailer");
const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = process.env;
function SendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                let transporter, info;
                const emailOptions = {
                    host: EMAIL_HOST,
                    port: EMAIL_PORT,
                    auth: {
                        user: EMAIL_USERNAME,
                        pass: EMAIL_PASSWORD,
                    },
                };
                transporter = (0, nodemailer_1.createTransport)(emailOptions);
                transporter.verify(function (err, success) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err)
                            return reject(new appError_1.default("InternalServerError", 400));
                        info = yield transporter.sendMail(Object.assign({ from: '"Autodrop" <' + EMAIL_USERNAME + ">" }, options));
                        resolve(info);
                    });
                });
            }
            catch (error) {
                reject(error);
            }
        });
    });
}
exports.default = SendEmail;
