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
exports.createPasswordResetToken = exports.verifyAccessToken = exports.responseAndToken = exports.createAccessToken = exports.comparePassword = exports.hashPassword = exports.newComparePassword = exports.newHashPassword = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = require("bcrypt");
const bcrypt = require('bcryptjs');
const newHashPassword = (password) => {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
};
exports.newHashPassword = newHashPassword;
const newComparePassword = (password, hashedPassword) => {
    const isMatch = bcrypt.compareSync(password, hashedPassword);
    return isMatch;
};
exports.newComparePassword = newComparePassword;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, bcrypt_1.hash)(password, 12);
    return hashedPassword;
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const isMatch = yield (0, bcrypt_1.compare)(password, hashedPassword);
    return isMatch;
});
exports.comparePassword = comparePassword;
const createAccessToken = (id) => {
    return (0, jsonwebtoken_1.sign)({ id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
};
exports.createAccessToken = createAccessToken;
const responseAndToken = (user, res, statusCode, req) => {
    const accessToken = (0, exports.createAccessToken)(user.id);
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() +
            Number(process.env.JWT_ACCESS_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        // secure: process.env.NODE_ENV === "production",
        secure: true,
    };
    res.cookie("accessToken", accessToken, cookieOptions);
    if (req) {
        //@ts-ignore
        req.session.user = {
            accessToken,
        };
        req.session.save((err) => {
            if (err) {
                // handle error
                console.log(err);
            }
            else {
                // session saved
                console.log("session saved");
                //@ts-ignore
                console.log(req.session.user.accessToken);
            }
        });
    }
    res.status(statusCode).json({
        status: "success",
        data: {
            accessToken,
            user,
        },
    });
};
exports.responseAndToken = responseAndToken;
const verifyAccessToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let payload = null;
    try {
        payload = yield (0, jsonwebtoken_1.verify)(token, 
        // @ts-ignore
        process.env.JWT_ACCESS_SECRET);
    }
    catch (err) {
        return null;
    }
    return payload;
});
exports.verifyAccessToken = verifyAccessToken;
const createPasswordResetToken = () => {
    const resetToken = crypto_1.default.randomBytes(6).toString("hex");
    const hashedResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return {
        resetToken,
        hashedResetToken,
        resetTokenExpiresAt,
        verifyAccessToken: exports.verifyAccessToken,
    };
};
exports.createPasswordResetToken = createPasswordResetToken;
