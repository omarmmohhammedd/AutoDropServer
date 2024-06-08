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
const authHelperFunction_1 = require("../authHelperFunction");
const user_model_1 = __importDefault(require("../../models/user.model"));
function TokenUserExtractor(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        let tokenValid = yield (0, authHelperFunction_1.verifyAccessToken)(token);
        if (!tokenValid) {
            return null;
        }
        if (tokenValid.id) {
            let user = yield user_model_1.default.findOne({ _id: tokenValid.id });
            return user;
        }
        else {
            let user = yield user_model_1.default.findOne({ _id: tokenValid._id });
            return user;
        }
    });
}
exports.default = TokenUserExtractor;
