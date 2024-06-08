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
const product_model_1 = require("../../../../models/product.model");
const catchAsync_1 = __importDefault(require("../../../../utils/catchAsync"));
const GetProductInfo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let { productId } = req.params;
    const product = yield product_model_1.Product.findById(productId).select("highestOptionValue country_code shippingIncludedChoiceIndex shippingIncludedChoice sallaTags categoriesSalla discountPrice showDiscountPrice commissionPercentage variantsArr shipping merchant salla_product_id metadata_description metadata_title options images sku quantity vendor_commission name description sku_id price target_sale_price target_original_price original_product_id").populate({
        path: "merchant",
        select: "setting",
        populate: {
            path: "setting",
            select: "highestPriceUnion originalPriceShipping",
        },
    });
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    let productJSON = product.toJSON();
    const highestPriceUnionEnabled = (_a = product.merchant.setting) === null || _a === void 0 ? void 0 : _a.highestPriceUnion;
    if (highestPriceUnionEnabled && (product === null || product === void 0 ? void 0 : product.highestOptionValue) !== 0) {
        productJSON.variantsArr = productJSON.variantsArr.map((variant) => {
            return Object.assign(Object.assign({}, variant), { offer_sale_price: product.highestOptionValue, old_offer_sale_price: variant.offer_sale_price });
        });
        productJSON.target_sale_price = product.highestOptionValue;
    }
    if (((_b = productJSON.merchant.setting) === null || _b === void 0 ? void 0 : _b.originalPriceShipping) === "shippingIncluded") {
        productJSON.shippingIncludedChoice = true;
    }
    else {
        productJSON.shippingIncludedChoice = false;
    }
    console.log(product.merchant);
    console.log("product", product);
    console.log("product.highestOptionValue", product === null || product === void 0 ? void 0 : product.highestOptionValue);
    if (product.merchant._id.toString() !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id).toString()) {
        return res
            .status(403)
            .json({ message: "You are not authorized to view this product" });
    }
    return res.status(200).json({ product: productJSON });
}));
exports.default = GetProductInfo;
