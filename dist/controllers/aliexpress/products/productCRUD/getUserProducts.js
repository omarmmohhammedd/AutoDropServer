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
exports.getUserProducts = void 0;
const axios_1 = require("axios");
const appError_1 = __importDefault(require("../../../../utils/appError"));
const product_model_1 = require("../../../../models/product.model");
function getUserProducts(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { role, _id } = req.user;
            console.log(req.user._id);
            console.log(typeof req.user._id);
            // const userProducts = await Product.find({ merchant: req.user._id });
            const userProducts = yield product_model_1.Product.find({ merchant: req.user._id }).select('_id name price quantity first_level_category_name salla_product_id shippingAvailable productValuesNumber').slice('images', 1);
            return res.json({ userProducts, success: true });
        }
        catch (error) {
            const isAxiosError = error instanceof axios_1.AxiosError;
            const values = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
            console.log(error + "\n\n\n");
            console.log(values);
            console.log(values.error.fields);
            next(isAxiosError ? new appError_1.default("UnprocessableEntity " + values, 400) : error);
        }
    });
}
exports.getUserProducts = getUserProducts;
