"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateMessage_1 = __importDefault(require("./generateMessage"));
function generateOptions(emails, template, keys) {
    const message = (0, generateMessage_1.default)(template, keys);
    const options = {
        to: emails,
        subject: "AutoDrop Customer Support",
        html: message,
    };
    return options;
}
exports.default = generateOptions;
