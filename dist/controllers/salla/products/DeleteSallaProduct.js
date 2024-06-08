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
exports.DeleteSallaProduct = void 0;
const SallaTokenModel_1 = __importDefault(require("../../../models/SallaTokenModel"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const axios_1 = __importDefault(require("axios"));
const product_model_1 = require("../../../models/product.model");
exports.DeleteSallaProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const salla_product_id = req.params.sallaProductId;
    const salla = yield SallaTokenModel_1.default.findById(req.user.sallaToken);
    if (!salla) {
        return res.status(404).json({ message: "Salla token not found" });
    }
    const { accessToken } = salla;
    const deleteSallaProductOpt = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
        },
        url: `https://api.salla.dev/admin/v2/products/${salla_product_id}`,
    };
    const { data: deleteResp } = yield axios_1.default.request(deleteSallaProductOpt);
    if (!deleteResp.success) {
        return res.status(400).json({
            status: "failed",
        });
    }
    let product = yield product_model_1.Product.findOne({
        salla_product_id,
        merchant: req.user._id.toString(),
    });
    console.log(product);
    if (!product) {
        return res.status(404).json({
            status: "failed",
            message: "Cannot find product",
        });
    }
    if (product) {
        product.salla_product_id = undefined;
        yield product.save();
    }
    console.log(deleteResp.success);
    return res.status(200).json({
        status: "success",
    });
}));
