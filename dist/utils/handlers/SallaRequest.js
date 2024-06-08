"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
function SallaRequest({ url, method, data, token, }) {
    const options = {
        baseURL: process.env.SALLA_API_URL,
        url,
        method,
        data,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
    return axios_1.default.request(options);
}
exports.default = SallaRequest;
