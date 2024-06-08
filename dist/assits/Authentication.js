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
const appError_1 = __importDefault(require("../utils/appError"));
const authHelperFunction_1 = require("../utils/authHelperFunction");
const tokenUserExtractor_1 = __importDefault(require("../utils/handlers/tokenUserExtractor"));
const Authentication = (role) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result;
        const token = req.headers["authorization"];
        if (!token)
            throw new appError_1.default("Token is required", 401);
        const matched = yield (0, authHelperFunction_1.verifyAccessToken)(token.replace(/Bearer /, ""));
        if (!matched)
            throw new appError_1.default("token is invalid", 401);
        if (role === "admin" && (matched === null || matched === void 0 ? void 0 : matched.userType) === "vendor")
            throw new appError_1.default("You do not have any access to do this action", 401);
        let user = yield (0, tokenUserExtractor_1.default)(req);
        // return error if account not found
        if (!user)
            throw new appError_1.default("User Not Found", 404);
        // console.log(req.session);
        // req.session.user = result;
        req.user = user;
        return next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = Authentication;
