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
const catchAsync_1 = __importDefault(require("../../../../utils/catchAsync"));
const product_model_1 = require("../../../../models/product.model");
const axios_1 = __importDefault(require("axios"));
const SallaTokenModel_1 = __importDefault(require("../../../../models/SallaTokenModel"));
const handleProductProperties = (product, reqBody) => __awaiter(void 0, void 0, void 0, function* () {
    let { name, description, commissionPercentage, showDiscountPrice, vendor_commission, productQuantity, metadata_description, metadata_title, categoriesSalla, require_shipping, selectedTags, shippingIncludedChoice, shippingIncludedChoiceIndex, variantsArr, options, images, discountPrice, shipping, country_code } = reqBody, body = __rest(reqBody, ["name", "description", "commissionPercentage", "showDiscountPrice", "vendor_commission", "productQuantity", "metadata_description", "metadata_title", "categoriesSalla", "require_shipping", "selectedTags", "shippingIncludedChoice", "shippingIncludedChoiceIndex", "variantsArr", "options", "images", "discountPrice", "shipping", "country_code"]);
    if (options) {
        product.options = options;
    }
    if (images) {
        product.images = images;
    }
    if (shipping) {
        product.shipping = shipping;
    }
    if (country_code) {
        product.country_code = country_code;
    }
    if (discountPrice !== undefined) {
        product.discountPrice = discountPrice;
    }
    if (variantsArr) {
        product.variantsArr = variantsArr;
        let totalQ = 0;
        variantsArr.forEach((variant) => {
            totalQ += Number(variant.sku_available_stock);
        });
        product.quantity = totalQ;
    }
    if (shippingIncludedChoice && shippingIncludedChoiceIndex) {
        product.shippingIncludedChoice = shippingIncludedChoice;
        product.shippingIncludedChoiceIndex = shippingIncludedChoiceIndex;
    }
    if (metadata_description) {
        product.metadata_description = metadata_description;
    }
    if (description) {
        product.description = description;
    }
    if (metadata_title) {
        product.metadata_title = metadata_title;
    }
    if (name) {
        product.name = name;
    }
    product.commissionPercentage = commissionPercentage;
    if (showDiscountPrice) {
        product.showDiscountPrice = showDiscountPrice;
    }
    product.vendor_commission = vendor_commission;
    product.commissionPercentage = commissionPercentage;
    if (categoriesSalla) {
        product.categoriesSalla = categoriesSalla;
    }
    if (require_shipping) {
        product.require_shipping = require_shipping;
    }
    return product;
});
const tagsSallaHandler = (sallaAccessToken, selectedTags) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("selectedTags", selectedTags);
    const promises = selectedTags.map((tag) => {
        const sallaOpt = {
            url: `https://api.salla.dev/admin/v2/products/tags?tag_name=${tag}`,
            method: "POST",
            headers: {
                Authorization: `Bearer ` + sallaAccessToken,
                "Content-Type": "application/json",
            },
        };
        return axios_1.default.request(sallaOpt);
    });
    let promisesSettled = yield Promise.allSettled(promises);
    let tagsSalla = promisesSettled.map((promise) => {
        if (promise.status === "rejected") {
            console.log(promise.reason);
            console.log(promise);
            return null;
        }
        console.log(promise);
        // [{id,name}]
        return promise.value.data.data;
    });
    console.log("tagsSalla", tagsSalla);
    return tagsSalla;
});
const PatchProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.params) {
        return res
            .status(400)
            .json({ message: "Missing productId in query parameters." });
    }
    console.log("reached Patch 1 ");
    //@ts-ignore
    let { productId } = req.params;
    let sallaToken = yield SallaTokenModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.sallaToken);
    if (!sallaToken) {
        return res.status(404).json({ message: "SallaToken Not Found." });
    }
    let { accessToken: sallaAccessToken } = sallaToken;
    let product = yield product_model_1.Product.findOne({
        //@ts-ignore
        merchant: req.user._id,
        _id: productId,
    });
    if (!product) {
        console.log("No product found");
        return res.status(404).json({ message: "Product Not Found." });
    }
    // product = await handleProductProperties(product,req.body)
    let _b = req.body, { name, description, commissionPercentage, showDiscountPrice, vendor_commission, productQuantity, metadata_description, metadata_title, categoriesSalla, require_shipping, selectedTags, shippingIncludedChoice, shippingIncludedChoiceIndex, variantsArr, options, images, discountPrice, shipping, country_code } = _b, body = __rest(_b, ["name", "description", "commissionPercentage", "showDiscountPrice", "vendor_commission", "productQuantity", "metadata_description", "metadata_title", "categoriesSalla", "require_shipping", "selectedTags", "shippingIncludedChoice", "shippingIncludedChoiceIndex", "variantsArr", "options", "images", "discountPrice", "shipping", "country_code"]);
    let sallaTags;
    // product = await handleProductProperties(product,req.body)
    if (options) {
        product.options = options;
    }
    if (images) {
        product.images = images;
    }
    if (shipping) {
        product.shipping = shipping;
    }
    if (country_code) {
        product.country_code = country_code;
    }
    if (discountPrice !== undefined) {
        product.discountPrice = discountPrice;
    }
    if (variantsArr) {
        product.variantsArr = variantsArr;
        let totalQ = 0;
        variantsArr.forEach((variant) => {
            totalQ += Number(variant.sku_available_stock);
        });
        product.quantity = totalQ;
    }
    if (selectedTags && selectedTags.length > 0) {
        sallaTags = yield tagsSallaHandler(sallaAccessToken, selectedTags);
    }
    if (shippingIncludedChoice && shippingIncludedChoiceIndex) {
        product.shippingIncludedChoice = shippingIncludedChoice;
        product.shippingIncludedChoiceIndex = shippingIncludedChoiceIndex;
    }
    // console.log("reached Patch 2 ");
    if (sallaTags && sallaTags.length > 0) {
        product.sallaTags = sallaTags;
    }
    if (product === null || product === void 0 ? void 0 : product.salla_product_id) {
        let axiosOptions = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: req.headers["authorization"],
            },
            url: `  ${process.env.Backend_Link}salla/deleteProduct/${product.salla_product_id}`,
        };
        let { data: deleteResp } = yield axios_1.default.request(axiosOptions);
        if (deleteResp.status !== "success") {
            return res.status(400).json({
                status: "failed",
            });
        }
        product.salla_product_id = undefined;
    }
    if (metadata_description) {
        product.metadata_description = metadata_description;
    }
    if (description) {
        product.description = description;
    }
    if (metadata_title) {
        product.metadata_title = metadata_title;
    }
    if (name) {
        product.name = name;
    }
    if (commissionPercentage) {
        product.commissionPercentage = commissionPercentage;
    }
    if (typeof showDiscountPrice == "boolean") {
        product.showDiscountPrice = showDiscountPrice;
    }
    product.vendor_commission = vendor_commission;
    product.commissionPercentage = commissionPercentage;
    if (categoriesSalla) {
        product.categoriesSalla = categoriesSalla;
    }
    if (require_shipping) {
        product.require_shipping = require_shipping;
    }
    console.log("before save");
    try {
        yield product.save();
    }
    catch (err) {
        console.error(err);
    }
    console.log("after save");
    const opt2 = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: req.headers["authorization"],
        },
        url: `${process.env.Backend_Link}aliexpress/product/linkProductSalla/v2`,
        data: {
            productId: product._id,
        },
    };
    let { data: response } = yield axios_1.default.request(opt2);
    if (response.status === "failed") {
        return res.status(400).json({
            status: "failed",
        });
    }
    return res.json({ message: "Product Patched Successfully" });
}));
exports.default = PatchProduct;
