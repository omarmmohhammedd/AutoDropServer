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
exports.aliexpressCallback = exports.aliexpressAuth = void 0;
const axios_1 = __importDefault(require("axios"));
let aliexpressData = {
    callbackUrl: "https://autodropserver.onrender.com/api/v1/auth/auth-aliexpress/callback",
    // "https://manatee-gorgeous-deeply.ngrok-free.app/api/v1/auth/auth-aliexpress/callback",
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
};
const aliexpressAuth = (req, res) => {
    const url = `https://api-sg.aliexpress.com/oauth/authorize?client_id=${aliexpressData.appKey}&redirect_uri=${aliexpressData.callbackUrl}&response_type=code&force_auth=true`;
    res.redirect(url);
};
exports.aliexpressAuth = aliexpressAuth;
const crypto_1 = require("crypto");
const aliexpressCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const aliexpressData = {
        appKey: process.env.APP_KEY,
        appSecret: process.env.APP_SECRET,
    };
    const code = req.query.code;
    let timestamp = Date.now();
    let params = {
        app_key: aliexpressData.appKey,
        code,
        sign_method: "sha256",
        timestamp: timestamp,
    };
    // Step 2: Sort all parameters and values according to the parameter name in ASCII table
    const sortedParams = Object.fromEntries(Object.entries(params).sort());
    // Step 3: Concatenate the sorted parameters and their values into a string
    let signString = "/auth/token/create";
    for (const [key, value] of Object.entries(sortedParams)) {
        signString += key + value;
    }
    // Step 4: Generate signature
    const hmac = (0, crypto_1.createHmac)("sha256", aliexpressData.appSecret);
    hmac.update(Buffer.from(signString, "utf-8")); // Encode the string in UTF-8 format
    const signature = hmac.digest("hex").toUpperCase();
    let formData = new FormData();
    formData.append("code", code);
    formData.append("app_key", "34271827");
    formData.append("sign_method", "sha256");
    formData.append("timestamp", timestamp.toString());
    formData.append("sign", signature);
    try {
        const response = yield axios_1.default.post("https://api-sg.aliexpress.com/rest/auth/token/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data; charset=utf-8",
            },
        });
        const respData = response.data;
        if (response.status >= 200 && response.status < 300) {
            const accessToken = respData.access_token;
            const refreshToken = respData.refresh_token;
            const frontendLink = new URL((process.env.Frontend_Link + "/en/LinkAccountAuth"));
            frontendLink.searchParams.append("accessToken", accessToken);
            frontendLink.searchParams.append("refreshToken", refreshToken);
            frontendLink.searchParams.append("tokenType", "AliExpress");
            return res.redirect(frontendLink.toString());
        }
        console.log(respData);
        res.status(200).json(respData);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.aliexpressCallback = aliexpressCallback;
/*
export const aliexpressCallback = async (req: Request, res: Response) => {
  const aliexpressData = {
    appkey: "34271827",
    appSecret: "2c5bcc0958a9d9abd339232f1b31712e",
    uuid: "uuid",
    code: req.query.code,
    url: "https://api-sg.aliexpress.com/",
  };
  let dataToSend: any;

  const python = spawn("python", ["./src/controllers/python/mytest.py"]);
  python.stdout.on("data", (data) => {
    console.log("Pipe data from python script ...");
    console.log(data.toString());
    dataToSend = data.toString();
  });

  python.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    res.send(dataToSend);
  });

  python.stdin.write(JSON.stringify(aliexpressData));
  python.stdin.end();
};
 */
