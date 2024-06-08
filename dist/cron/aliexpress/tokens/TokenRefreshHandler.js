"use strict";
//@ts-nocheck
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
const user_model_1 = __importDefault(require("../../../models/user.model"));
const SallaTokenModel_1 = __importDefault(require("../../../models/SallaTokenModel"));
const axios_1 = __importDefault(require("axios"));
const RefreshAccessToken_1 = require("../../../controllers/salla/RefreshAccessToken");
// const time: string = "0 0 */5 * *";
const time = "*/10 * * * * *";
const TokenRefreshHandler = (0, node_cron_1.schedule)(time, function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("cron job started to refresh users token");
            let limit = 10;
            let page = 1;
            let options = {
                limit,
                page,
                populate: ["aliExpressToken", "sallaToken"],
            };
            let results;
            let users;
            do {
                results = yield user_model_1.default.paginate({}, options);
                users = results.docs;
                for (const user of users) {
                    let { aliExpressToken, sallaToken } = user;
                    let sallaDoc = yield SallaTokenModel_1.default.findOne({
                        _id: sallaToken,
                    });
                    if (!sallaDoc)
                        continue;
                    const refresh = yield (0, RefreshAccessToken_1.RefreshTokenHandler)(sallaDoc.accessToken, sallaToken);
                    // const {data:info} = await GetUserInfo(sallaDoc.accessToken)
                    // const { data: userInfo } = info;
                    // console.log(userData)
                    // if (sallaDoc) {
                    //   let { accessToken, refreshToken } = sallaDoc;
                    //   let sallaReqOpt = {
                    //     method: "post",
                    //     url: "https://accounts.salla.sa/oauth2/token",
                    //     headers: {
                    //       "Content-Type": "application/x-www-form-urlencoded",
                    //       Authorization: "Bearer " + accessToken,
                    //     },
                    //     data: qs.stringify({
                    //       refresh_token: refreshToken,
                    //       grant_type: "refresh_token",
                    //       client_id: process.env.SALLA_CLIENT_ID,
                    //       client_secret: process.env.SALLA_CLIENT_SECRET,
                    //     }),
                    //   };
                    //   // console.log(sallaReqOpt)
                    //   let sallaRefreshTokenRes = await axios(sallaReqOpt);
                    //   // console.log("sallaRefreshTokenRes",sallaRefreshTokenRes)
                    //   // console.log(sallaRefreshTokenRes)
                    //   let { access_token, refresh_token,expires_in } = sallaRefreshTokenRes.data;
                    //   fs.appendFile("sallaTokenCRON.json", JSON.stringify({ access_token, refresh_token }), () => {});
                    //   sallaDoc.accessToken = access_token;
                    //   sallaDoc.refreshToken = refresh_token;
                    //   sallaDoc.expires_in = expires_in
                    //   await sallaDoc.save();
                    // }
                    // let aliExpressDoc = await AliExpressToken.findById(aliExpressToken);
                    // if(aliExpressDoc){
                    //   const app_key =process.env.APP_KEY!
                    //   const refresh_token = aliExpressDoc.refreshToken
                    //   const secret = process.env.APP_SECRET!
                    //   const base = process.env.ALI_API_BASE!
                    //   const timestamp = new Date(
                    //     dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
                    //   ).getTime();
                    //   const method = "/auth/token/refresh";
                    //   const body = {
                    //     app_key,
                    //     refresh_token,
                    //     sign_method: "sha256",
                    //     timestamp,
                    //     method,
                    //   };
                    //   const values = GenerateValues(body);
                    //   const sign = GenerateSign(values);
                    //   const { data } = await axios.get(base, {
                    //     params: { ...body, sign },
                    //   });
                    //   const key = method + "_response";
                    //   const result = data[key];
                    //   const error = data.error_response;
                    //   const {
                    //     access_token,
                    //     refresh_token: _refresh_token,
                    //     expire_time,
                    //     refresh_token_valid_time,
                    //   } = pick(result, [
                    //     "access_token",
                    //     "refresh_token",
                    //     "expire_time",
                    //     "refresh_token_valid_time",
                    //   ]);
                    //   aliExpressDoc.accessToken = access_token
                    //   aliExpressDoc.refreshToken = _refresh_token
                    //   console.log("access_token",access_token)
                    //   console.log("refresh_token",_refresh_token)
                    //   await aliExpressDoc.save()
                    // }
                }
                page++;
                options.page = page;
            } while (users.length == limit);
        }
        catch (error) {
            console.log("Error while refreshing user tokens..");
            // console.log(error.response.data);
            console.log(error);
        }
    });
});
exports.default = TokenRefreshHandler;
function GetUserInfo(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            baseURL: 'https://api.salla.dev/admin/v2/',
            url: 'oauth2/user/info',
            method: 'get',
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            timeout: 100000
        };
        try {
            return yield (0, axios_1.default)(options);
        }
        catch (error) {
        }
    });
}
