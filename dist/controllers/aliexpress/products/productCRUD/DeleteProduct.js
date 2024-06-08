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
exports.DeleteProductById = void 0;
const catchAsync_1 = __importDefault(require("../../../../utils/catchAsync"));
const product_model_1 = require("../../../../models/product.model");
const axios_1 = __importDefault(require("axios"));
const SallaTokenModel_1 = __importDefault(require("../../../../models/SallaTokenModel"));
exports.DeleteProductById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params) {
        return res
            .status(400)
            .json({ message: "Missing productId in query parameters." });
    }
    //@ts-ignore
    let { productId } = req.params;
    console.log("productId", productId);
    let product = yield product_model_1.Product.findOne({
        //@ts-ignore
        merchant: req.user._id,
        _id: productId,
    });
    console.log("product", product);
    if (!product) {
        console.log("No product found");
        return res.status(404).json({ message: "Product Not Found." });
    }
    if (product === null || product === void 0 ? void 0 : product.salla_product_id) {
        try {
            const sallaTokenDocument = yield SallaTokenModel_1.default.findOne({
                _id: req.user.sallaToken,
            });
            if (!sallaTokenDocument || !req.user.sallaToken) {
                return res.status(404).json({ message: "SallaToken Not Found." });
            }
        }
        catch (e) {
            console.log(e);
        }
        let axiosOptions = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: req.headers["authorization"],
            },
            url: `  ${process.env.Backend_Link}salla/deleteProduct/${product.salla_product_id}`,
        };
        try {
            let { data: deleteResp } = yield axios_1.default.request(axiosOptions);
            if (!res.headersSent && deleteResp.status !== "success") {
                return res.status(400).json({
                    status: "failed",
                });
            }
        }
        catch (e) {
        }
        product.salla_product_id = undefined;
    }
    yield product_model_1.Product.deleteOne({ _id: product._id });
    if (!res.headersSent) {
        return res.json({ message: "Product deleted" });
    }
}));
