"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AliExpressTokenSchema = new mongoose_1.default.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
});
const AliExpressToken = mongoose_1.default.model("AliExpressToken", AliExpressTokenSchema);
exports.default = AliExpressToken;
