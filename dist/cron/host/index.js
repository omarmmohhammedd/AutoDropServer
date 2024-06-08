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
const node_cron_1 = require("node-cron");
const axios_1 = __importDefault(require("axios"));
const time = "*/15 * * * *";
const RequestSenderToHost = (0, node_cron_1.schedule)(time, function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("cron job started to Send req to prod host to not sleep");
            let axiosOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                url: `  ${process.env.BACKEND_LIVE_LINK}`,
            };
            yield axios_1.default.request(axiosOptions);
        }
        catch (error) {
            console.log("Error while Send req to prod host to not sleep..");
            console.log(error);
        }
    });
});
exports.default = RequestSenderToHost;
