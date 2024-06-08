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
exports.saveTokenToUser = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AliExpressTokenModel_1 = __importDefault(require("../models/AliExpressTokenModel"));
const SallaTokenModel_1 = __importDefault(require("../models/SallaTokenModel"));
const SallaRequest_1 = __importDefault(require("../utils/handlers/SallaRequest"));
exports.saveTokenToUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("here");
    const { accessToken, refreshToken, userId, tokenType } = req.body;
    if (!accessToken || !refreshToken || !userId || !tokenType) {
        return next(new appError_1.default("Please provide access token, refresh token, user id and token type", 400));
    }
    let token;
    if (tokenType === "AliExpress") {
        // Create a new AliExpressToken document
        yield AliExpressTokenModel_1.default.deleteMany({ userId });
        token = new AliExpressTokenModel_1.default({ accessToken, refreshToken, userId });
        yield token.save();
        // console.log(token)
    }
    else if (tokenType === "Salla") {
        // Create a new SallaToken document
        yield SallaTokenModel_1.default.deleteMany({ userId });
        token = new SallaTokenModel_1.default({ accessToken, refreshToken, userId });
        yield token.save();
    }
    else {
        return next(new appError_1.default("Invalid token type", 400));
    }
    // Update the user's token field
    let update = {};
    switch (tokenType) {
        case "AliExpress":
            update = { aliExpressToken: token._id };
            break;
        case "Salla":
            update = { sallaToken: token._id };
            break;
        // Add more cases as needed
        default:
            return next(new appError_1.default("Invalid token type", 400));
    }
    const user = yield user_model_1.default.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
        return next(new appError_1.default("User not found", 404));
    }
    if (tokenType == "Salla") {
        // get merchantID and save it to user 
        try {
            let sallaReqOptUser = {
                method: "GET",
                url: "/oauth2/user/info",
                token: accessToken,
            };
            let sallaReqOptStore = {
                method: "GET",
                url: "/store/info",
                token: accessToken,
            };
            let [userSallaInfo, storeSallaInfo] = yield Promise.allSettled([(0, SallaRequest_1.default)(sallaReqOptUser), (0, SallaRequest_1.default)(sallaReqOptStore)]);
            if (userSallaInfo.status == "fulfilled") {
                let { data } = userSallaInfo.value;
                let merchantID = data.data.merchant.id;
                user.merchantID = merchantID;
                yield user.save();
                // console.log("merchantID stored",merchantID)
            }
            else {
                // console.log(userSallaInfo.reason)
            }
            if (storeSallaInfo.status == "fulfilled") {
                let { data } = storeSallaInfo.value;
                let storeName = data.data.name;
                let storeLink = data.data.domain;
                user.storeName = storeName;
                user.storeLink = storeLink;
                yield user.save();
                // console.log("storeName stored",storeName)
            }
            else {
                // console.log(storeSallaInfo.reason)
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
}));
