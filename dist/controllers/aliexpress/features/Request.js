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
exports.MakeRequestImage = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const axios_1 = __importDefault(require("axios"));
const GenerateSignature_1 = require("./GenerateSignature");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
function MakeRequest(values, aliToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
        const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH] = yield Promise.all([
            // findSettingKey("ALI_APP_KEY"),
            process.env.APP_KEY,
            process.env.ALI_API_BASE,
            aliToken.aliExpressAccessToken,
            aliToken.aliExpressRefreshToken,
            // findSettingKey("ALI_TOKEN"),
            // findSettingKey("ALI_REFRESH_TOKEN"),
        ]);
        const data = Object.assign(Object.assign({}, values), { app_key: ALI_APP_KEY, access_token: ALI_TOKEN, timestamp });
        const sign = (0, GenerateSignature_1.GenerateSign)((0, GenerateSignature_1.GenerateValues)(data));
        return (0, axios_1.default)({
            url: ALI_BASE + "/" + (values === null || values === void 0 ? void 0 : values.method),
            method: "post",
            data: Object.assign(Object.assign({}, data), { sign }),
        });
    });
}
exports.default = MakeRequest;
function MakeRequestImage(values, aliToken, imageBytes) {
    return __awaiter(this, void 0, void 0, function* () {
        const timestamp = new Date((0, dayjs_1.default)().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")).getTime();
        const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH] = yield Promise.all([
            process.env.APP_KEY,
            process.env.ALI_API_BASE,
            aliToken.aliExpressAccessToken,
            aliToken.aliExpressRefreshToken,
        ]);
        const data = Object.assign(Object.assign({}, values), { app_key: ALI_APP_KEY, timestamp });
        const dataReference = {
            shpt_to: "SA",
            target_currency: "SAR",
            product_cnt: 10,
            target_language: "EN",
            sort: "SALE_PRICE_ASC",
            method: "aliexpress.ds.image.search",
            app_key: ALI_APP_KEY,
            sign_method: "sha256",
            timestamp: "1710788659736",
        };
        const sign = (0, GenerateSignature_1.GenerateSign)((0, GenerateSignature_1.GenerateValues)(data));
        console.log("sign", sign);
        console.log("sign", sign);
        console.log("sign", sign);
        console.log("sign", sign);
        console.log("sign", sign);
        let data2 = Object.assign(Object.assign({}, data), { sign });
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        formData.append("sign", sign);
        let file = new File([imageBytes.buffer], imageBytes.originalname, { type: imageBytes.mimetype });
        formData.append('image_file_bytes', file);
        console.log("imageBytes", imageBytes);
        return (0, axios_1.default)({
            url: ALI_BASE + "/" + (values === null || values === void 0 ? void 0 : values.method),
            method: "post",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data; charset=utf-8",
            },
        });
    });
}
exports.MakeRequestImage = MakeRequestImage;
