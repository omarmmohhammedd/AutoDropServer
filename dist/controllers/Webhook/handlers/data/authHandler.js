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
exports.CheckTokenExpire = void 0;
const token_1 = require("../token");
const appError_1 = __importDefault(require("../../../../utils/appError"));
const user_model_1 = __importDefault(require("../../../../models/user.model"));
const Authentication = (role) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result, account;
        const token = req.headers["authorization"];
        if (!token)
            throw new appError_1.default("Not found", 404);
        const matched = yield (0, token_1.VerifyToken)(token.replace(/Bearer /, ""));
        if (!matched)
            throw new appError_1.default("Forbidden", 403);
        if (role === "admin" && (matched === null || matched === void 0 ? void 0 : matched.userType) === "vendor")
            throw new appError_1.default("You do not have any access to do this action", 403);
        account = yield user_model_1.default.findOne((matched === null || matched === void 0 ? void 0 : matched.userType) === "vendor"
            ? { merchantId: matched.merchant }
            : { _id: matched.userId }).exec();
        // return error if account not found
        if (!account)
            throw new appError_1.default("Not Found", 404);
        if ((matched === null || matched === void 0 ? void 0 : matched.userType) === "vendor") {
            const access_token = CheckTokenExpire(matched === null || matched === void 0 ? void 0 : matched.token);
            // result.access_token = access_token;
            // result.merchant = matched.merchant;
            result = {
                access_token: access_token,
                merchant: matched.merchant,
            };
        }
        result = Object.assign(Object.assign({}, result), { user_id: account === null || account === void 0 ? void 0 : account.id, userType: matched === null || matched === void 0 ? void 0 : matched.userType });
        // console.log(req.session);
        // req.session.user = result;
        req.local = result;
        return next();
    }
    catch (error) {
        next(error);
    }
});
function CheckTokenExpire(token) {
    let expired = false;
    const { access_token, expires, refresh_token } = JSON.parse(token);
    // 1680991559
    expired = new Date().getTime() > new Date(expires * 1000).getTime();
    return expired ? refresh_token : access_token;
}
exports.CheckTokenExpire = CheckTokenExpire;
exports.default = Authentication;
