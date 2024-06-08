"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SallaTokenSchema = new mongoose_1.default.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expires_in: { type: Number, default: null },
    expires_at: { type: Date, default: null },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
});
SallaTokenSchema.pre("save", function (next) {
    if (this.expires_in) {
        const expires_at = new Date(Date.now() + this.expires_in * 1000);
        this.expires_at = expires_at;
        // Convert expiresIn to milliseconds  
    }
    next();
});
const SallaToken = mongoose_1.default.model("SallaToken", SallaTokenSchema);
exports.default = SallaToken;
