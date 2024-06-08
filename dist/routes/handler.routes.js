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
const express_1 = __importDefault(require("express"));
const authHelperFunction_1 = require("../utils/authHelperFunction");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const tokenUserExtractor_1 = __importDefault(require("../utils/handlers/tokenUserExtractor"));
const router = express_1.default.Router();
router.post("/change-password", (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { currentPassword, newPassword, confirmPassword } = req.body;
    console.log(req.body);
    let user = yield (0, tokenUserExtractor_1.default)(req);
    console.log(user);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    if (newPassword !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match" });
    console.log("password matched");
    // let isMatch = await user.comparePassword(currentPassword);
    console.log(req.body);
    let isMatch = yield (0, authHelperFunction_1.newComparePassword)(currentPassword, user.password);
    let newPass = yield (0, authHelperFunction_1.newHashPassword)(newPassword);
    // let isMatch = await compare(currentPassword, user.password);
    console.log(isMatch);
    if (!isMatch)
        return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPass;
    yield user.save();
    res.status(200).json({ message: "Password changed successfully" });
})));
exports.default = router;
