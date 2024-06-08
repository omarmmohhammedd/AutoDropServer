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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserData = exports.updateUserSettings = exports.getUserSettings = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const Setting_model_1 = __importDefault(require("../../models/Setting.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
exports.getUserSettings = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.setting) {
        throw new Error("User settings not found");
    }
    const setting = yield Setting_model_1.default.findById(req.user.setting);
    if (setting) {
        let _a = setting.toObject(), { _id, __v } = _a, settingWithoutIdAndVersion = __rest(_a, ["_id", "__v"]);
        return res.json({
            status: "success",
            data: settingWithoutIdAndVersion,
        });
    }
    return res.status(400).json({
        status: "fail",
        message: "Failed to get settings",
    });
}));
exports.updateUserSettings = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.setting) {
        throw new Error("User settings not found");
    }
    const setting = yield Setting_model_1.default.findByIdAndUpdate(req.user.setting, req.body, {
        new: true,
    });
    if (setting) {
        const _b = setting.toObject(), { _id, __v } = _b, settingWithoutIdAndVersion = __rest(_b, ["_id", "__v"]);
        return res.json({
            status: "success",
            data: settingWithoutIdAndVersion,
        });
    }
    else {
        return res.status(400).json({
            status: "failed",
            message: "Failed to update settings",
        });
    }
}));
exports.updateUserData = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    yield user_model_1.default.findByIdAndUpdate(req.user._id, Object.assign({}, req.body), { new: true }).then((user) => res.status(201).json({ user }));
}));
