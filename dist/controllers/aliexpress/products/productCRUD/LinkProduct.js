"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.LinkProductSalla2 = exports.updateVariantFinalOptionOld = exports.updateVariantFinalOption2 = void 0;
const axios_1 = __importStar(require("axios"));
const appError_1 = __importDefault(require("../../../../utils/appError"));
const product_model_1 = require("../../../../models/product.model");
const SallaTokenModel_1 = __importDefault(require("../../../../models/SallaTokenModel"));
const AliExpressTokenModel_1 = __importDefault(require("../../../../models/AliExpressTokenModel"));
const CRUD_1 = require("./CRUD");
const AlreadyLinkedProduct_1 = require("./features/AlreadyLinkedProduct");
const VariantsPatcher_1 = __importDefault(require("./features/VariantsPatcher"));
const fs_1 = __importDefault(require("fs"));
const CheckSubscription_1 = require("../../../../utils/handlers/CheckSubscription");
const WebSocketSender_1 = require("../../../../utils/handlers/WebSocketSender");
const Subscription_model_1 = require("../../../../models/Subscription.model");
const updateVariantFinalOption2 = (product, token, tokenData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = yield (0, CRUD_1.getProductVariants)(product.salla_product_id, 1, token);
    console.log((_a = data === null || data === void 0 ? void 0 : data.pagination) === null || _a === void 0 ? void 0 : _a.totalPages);
    let { totalPages, perPage, currentPage } = data === null || data === void 0 ? void 0 : data.pagination;
    let beginIndex = 0;
    if (currentPage == 1) {
        beginIndex = 0;
    }
    else {
        beginIndex = currentPage * perPage;
    }
    const errorArray = yield (0, VariantsPatcher_1.default)({
        product,
        totalPages,
        beginIndex,
        perPage,
        token,
        variantsResponse: data,
        currentPage,
    });
    console.log("errorArray", errorArray);
    console.log("totalPages", totalPages);
    if (totalPages == 1) {
        return;
    }
    // let { totalPages, perPage, currentPage } = data?.pagination;
    let currentIndex = perPage;
    beginIndex = perPage;
    for (let i = 2; i <= totalPages; i++) {
        console.log("MULTIPLE PAGES", i);
        const dataPage2 = yield (0, CRUD_1.getProductVariants)(product.salla_product_id, i, token);
        currentPage = dataPage2.pagination.currentPage;
        const errorArray = yield (0, VariantsPatcher_1.default)({
            product,
            totalPages,
            beginIndex,
            perPage,
            token,
            variantsResponse: dataPage2,
            currentPage,
        });
        console.log("errorArray", errorArray);
    }
    return;
});
exports.updateVariantFinalOption2 = updateVariantFinalOption2;
const updateVariantFinalOptionOld = (product, token, tokenData) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const jsonProduct = product.toJSON();
    const data = yield (0, CRUD_1.getProductVariants)(product.salla_product_id, 1, token);
    console.log((_b = data === null || data === void 0 ? void 0 : data.pagination) === null || _b === void 0 ? void 0 : _b.totalPages);
    const variants = (_c = data === null || data === void 0 ? void 0 : data.data) === null || _c === void 0 ? void 0 : _c.filter((e) => !e.sku);
    if (!variants) {
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
        console.log("No variants");
    }
    let variantsIds = variants.map((el) => {
        return el.id;
    });
    console.log("variantsIds", variantsIds);
    console.log("variantsIds.length", variantsIds.length);
    console.log("variantsIds.length", variantsIds.length);
    console.log("variantsIds.length", variantsIds.length);
    console.log("variantsIds.length", variantsIds.length);
    let { variantsArr, showDiscountPrice } = product;
    console.log("variantsArr", variantsArr);
    let promises = variantsArr.map((el, index) => {
        var _a, _b, _c, _d;
        let variantId = variantsIds[index];
        let { offer_sale_price: priceString, sku_available_stock: quantity, sku_id, sku_price: oldPrice, shippingChoice, commission, profitTypeValue } = el;
        let price = parseFloat(priceString);
        console.log("quantity", quantity);
        if (commission != 0 && commission > 0) {
            if (profitTypeValue == "number") {
                price = (price) + commission;
            }
            else if (profitTypeValue == "percentage") {
                price =
                    (commission / 100) * (price) +
                        (price);
            }
        }
        else {
            if ((product === null || product === void 0 ? void 0 : product.vendor_commission) && !(product === null || product === void 0 ? void 0 : product.commissionPercentage)) {
                price = (price) + (product === null || product === void 0 ? void 0 : product.vendor_commission);
            }
            else if ((product === null || product === void 0 ? void 0 : product.vendor_commission) && (product === null || product === void 0 ? void 0 : product.commissionPercentage)) {
                price =
                    ((product === null || product === void 0 ? void 0 : product.vendor_commission) / 100) * (price) +
                        (price);
            }
        }
        // console.log("product?.options",product?.options)
        if (
        //@ts-ignore
        ((_a = product === null || product === void 0 ? void 0 : product.shipping) === null || _a === void 0 ? void 0 : _a.length) != 0 && shippingChoice == "shippingIncluded") {
            let shippingIncludedChoiceIndex = 0;
            if (product === null || product === void 0 ? void 0 : product.shippingIncludedChoice) {
                shippingIncludedChoiceIndex = (product === null || product === void 0 ? void 0 : product.shippingIncludedChoiceIndex) || 0;
            }
            //@ts-ignore
            console.log("product?.shippingIncludedChoice", product === null || product === void 0 ? void 0 : product.shippingIncludedChoice);
            console.log("product?.shippingIncludedChoiceIndex", product === null || product === void 0 ? void 0 : product.shippingIncludedChoiceIndex);
            let extraShippingCost = 
            //@ts-ignore
            ((_d = (_c = (_b = product === null || product === void 0 ? void 0 : product.shipping) === null || _b === void 0 ? void 0 : _b[shippingIncludedChoiceIndex]) === null || _c === void 0 ? void 0 : _c.freight) === null || _d === void 0 ? void 0 : _d.cent) / 100;
            console.log("extraShippingCost", extraShippingCost);
            price += extraShippingCost;
            console.log("price", price);
        }
        let mnp = getRandomInt(100000000000000, 999999999999999);
        let gitin = getRandomInt(10000000000000, 99999999999999);
        let barcode = [mnp, gitin].join("");
        // add condition for sale enabling in product
        if (oldPrice && showDiscountPrice) {
            return (0, CRUD_1.UpdateProductVariantSale)(variantId, barcode, oldPrice, quantity, mnp, gitin, sku_id, token, price);
        }
        return (0, CRUD_1.UpdateProductVariant)(variantId, barcode, price, quantity, mnp, gitin, sku_id, token);
    });
    let results = yield Promise.all(promises);
    console.log("results.length", results.length);
    let errorArrayVariants = [];
    results.forEach((result) => {
        if (!result) {
            errorArrayVariants.push(result);
            console.log("A VARIANT IS UNDEFINED");
        }
        console.log(result === null || result === void 0 ? void 0 : result.data);
    });
    console.log("errorArrayVariants", errorArrayVariants);
    return;
});
exports.updateVariantFinalOptionOld = updateVariantFinalOptionOld;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
function LinkProductSalla2(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
        try {
            console.log("reached this 1 ");
            const { role, _id } = req.user;
            let subscription = yield (0, CheckSubscription_1.CheckSubscription)(_id.toString(), "products_limit");
            let { productId } = req.body;
            let product = yield product_model_1.Product.findById(productId);
            if (!product)
                return res
                    .status(404)
                    .json({ message: "Cannot find product with the given id" });
            const sallaTokenDocument = yield SallaTokenModel_1.default.findOne({
                _id: req.user.sallaToken,
            });
            if (!req.user.sallaToken || !sallaTokenDocument) {
                return res.status(404).json({ message: "SallaToken Not Found." });
            }
            const aliexpressDoc = yield AliExpressTokenModel_1.default.findOne({
                _id: req.user.aliExpressToken,
            });
            let { accessToken } = sallaTokenDocument;
            let token = accessToken;
            let access_token = accessToken;
            let tokenData = {
                aliExpressAccessToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.accessToken,
                aliExpressRefreshToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.refreshToken,
            };
            const jsonProduct = product === null || product === void 0 ? void 0 : product.toJSON();
            /*  if (userType === "admin") {
              account = await User.findOne({
                _id: merchant,
                userType: "vendor",
              }).exec();
            }  */
            console.log("reached this 2 ");
            let noOptionsInProduct = false;
            let prodPrice = parseFloat(product.variantsArr[0].offer_sale_price);
            let totalPrice = ((product === null || product === void 0 ? void 0 : product.vendor_commission) / 100) * prodPrice + prodPrice;
            /*    console.log("product.commissionPercentage", product.commissionPercentage);
            console.log("product?.vendor_commission", product?.vendor_commission); */
            if (!product.commissionPercentage) {
                totalPrice = (product === null || product === void 0 ? void 0 : product.vendor_commission) + prodPrice;
            }
            if (
            //@ts-ignore
            ((_a = product === null || product === void 0 ? void 0 : product.shipping) === null || _a === void 0 ? void 0 : _a.length) != 0 &&
                product.shippingIncludedChoice &&
                product.shippingIncludedChoiceIndex !== -1) {
                console.log("product.shippingIncludedChoice", product.shippingIncludedChoice);
                console.log("product.shippingIncludedChoiceIndex", product.shippingIncludedChoiceIndex);
                //@ts-ignore
                totalPrice +=
                    //@ts-ignore
                    ((_b = product === null || product === void 0 ? void 0 : product.shipping) === null || _b === void 0 ? void 0 : _b[product.shippingIncludedChoiceIndex].freight.cent) /
                        100;
            }
            let bodyDataSalla = {
                name: req.query.name || product.name,
                price: totalPrice,
                product_type: product.product_type,
                quantity: product === null || product === void 0 ? void 0 : product.quantity,
                description: product.description,
                cost_price: product.main_price,
                require_shipping: product.require_shipping,
                sku: product.sku,
                images: product.images,
                // options: product.options,
                metadata_title: product === null || product === void 0 ? void 0 : product.metadata_title,
                metadata_description: product === null || product === void 0 ? void 0 : product.metadata_description,
            };
            if (product.sallaTags) {
                let prodTags = product.sallaTags
                    .filter((t) => t)
                    .map((tag) => tag.id);
                bodyDataSalla.tags = prodTags;
                console.log("prodTags", prodTags);
            }
            //@ts-ignore
            if ((_d = (_c = product === null || product === void 0 ? void 0 : product.options) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.name) {
                bodyDataSalla.options = product.options;
            }
            if (product === null || product === void 0 ? void 0 : product.categoriesSalla) {
                bodyDataSalla.categories = product === null || product === void 0 ? void 0 : product.categoriesSalla;
            }
            if (product === null || product === void 0 ? void 0 : product.showDiscountPrice) {
                let originalPrice = parseFloat(product.variantsArr[0].sku_price);
                if ((product === null || product === void 0 ? void 0 : product.discountPrice) && (product === null || product === void 0 ? void 0 : product.discountPrice) > 0 && typeof Number(product === null || product === void 0 ? void 0 : product.discountPrice) == "number") {
                    originalPrice = Number(product === null || product === void 0 ? void 0 : product.discountPrice);
                }
                bodyDataSalla.price = originalPrice;
                bodyDataSalla.sale_price = totalPrice;
            }
            //@ts-ignore
            if (!((_f = (_e = product === null || product === void 0 ? void 0 : product.options) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.name)) {
                noOptionsInProduct = true;
            }
            const options_1 = {
                method: "POST",
                url: "https://api.salla.dev/admin/v2/products",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: bodyDataSalla,
            };
            console.log("here");
            let createdeProduct = yield (0, AlreadyLinkedProduct_1.ProductSallaChecker)(options_1, product === null || product === void 0 ? void 0 : product.sku, token, req, res, next, product);
            if ((createdeProduct === null || createdeProduct === void 0 ? void 0 : createdeProduct.message) == "Cancel") {
                return;
            }
            else if ((createdeProduct === null || createdeProduct === void 0 ? void 0 : createdeProduct.message) == "Error") {
                throw new appError_1.default("sku already linked to a product on Salla", 400);
            }
            console.log("createdeProduct?.status", createdeProduct === null || createdeProduct === void 0 ? void 0 : createdeProduct.status);
            if (!createdeProduct || !(createdeProduct === null || createdeProduct === void 0 ? void 0 : createdeProduct.data)) {
                try {
                    createdeProduct = yield axios_1.default.request(options_1);
                }
                catch (error) {
                    console.error(error);
                }
            }
            const opt = {
                method: "GET",
                url: `https://api.salla.dev/admin/v2/products/${createdeProduct.data.id}`,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            console.log("here");
            const { data: productResult } = yield axios_1.default.request(opt);
            console.log(createdeProduct.data.id);
            fs_1.default.writeFile("productResult.json", JSON.stringify({ productResult }, null, 2), (err) => {
                console.error(err);
            });
            if (!noOptionsInProduct) {
                // fs.appendFile("info.json","executed if statement",(err)=>{console.error(err)})
                console.log("executed if statement");
                product.options = yield Promise.all((_g = jsonProduct === null || jsonProduct === void 0 ? void 0 : jsonProduct.options) === null || _g === void 0 ? void 0 : _g.map((option, index) => __awaiter(this, void 0, void 0, function* () {
                    var _20, _21, _22;
                    let obj = option;
                    const productOption = (_21 = (_20 = productResult === null || productResult === void 0 ? void 0 : productResult.data) === null || _20 === void 0 ? void 0 : _20.options) === null || _21 === void 0 ? void 0 : _21[index];
                    const values = yield Promise.all((_22 = option === null || option === void 0 ? void 0 : option.values) === null || _22 === void 0 ? void 0 : _22.map((value, idx) => __awaiter(this, void 0, void 0, function* () {
                        var _23;
                        const optionValue = (_23 = productOption === null || productOption === void 0 ? void 0 : productOption.values) === null || _23 === void 0 ? void 0 : _23[idx];
                        console.log(optionValue);
                        const mnp = getRandomInt(100000000000000, 999999999999999);
                        const gitin = getRandomInt(10000000000000, 99999999999999);
                        return Object.assign(Object.assign({}, value), { mpn: mnp, gtin: gitin, salla_value_id: optionValue === null || optionValue === void 0 ? void 0 : optionValue.id });
                    })));
                    obj.salla_option_id = productOption === null || productOption === void 0 ? void 0 : productOption.id;
                    obj.values = values;
                    //this is new
                    return obj;
                })));
                const finalOptions = yield Promise.all((_h = jsonProduct === null || jsonProduct === void 0 ? void 0 : jsonProduct.options) === null || _h === void 0 ? void 0 : _h.map((option, idx) => __awaiter(this, void 0, void 0, function* () {
                    var _24;
                    const values = yield Promise.all((_24 = option === null || option === void 0 ? void 0 : option.values) === null || _24 === void 0 ? void 0 : _24.map((optionValue, i) => __awaiter(this, void 0, void 0, function* () {
                        return optionValue;
                    })));
                    return Object.assign(Object.assign({}, option), { values });
                })));
                product.options = finalOptions;
                let sallaValuesIds = finalOptions.map((option) => {
                    let { salla_option_id, values } = option;
                    values = values.map((value) => {
                        let { sku, salla_value_id } = value;
                        return { sku, salla_value_id };
                    });
                    return { values, salla_option_id };
                });
                // update variants with salla_value_id
                const variantsArr = (_j = jsonProduct === null || jsonProduct === void 0 ? void 0 : jsonProduct.variantsArr) === null || _j === void 0 ? void 0 : _j.map((variant) => {
                    var _a;
                    let { sku_code } = variant;
                    let sku_code_split = sku_code.split(";");
                    let sallaValues = [];
                    for (let i = 0; i < sallaValuesIds.length; i++) {
                        let salla_value_id = (_a = sallaValuesIds[i].values.find((value) => sku_code_split.includes(value.sku))) === null || _a === void 0 ? void 0 : _a.salla_value_id;
                        sallaValues.push(salla_value_id);
                    }
                    return Object.assign(Object.assign({}, variant), { sallaValues });
                });
                // 
                product.variantsArr = variantsArr;
                // fs.appendFile("info.json",JSON.stringify({finalOptions},null,2),(err)=>{console.error(err)})
                // fs.appendFile("variantsArr.json",JSON.stringify({variantsArr},null,2),(err)=>{console.error(err)})
            }
            product.salla_product_id = (_k = productResult.data) === null || _k === void 0 ? void 0 : _k.id;
            yield product.save();
            if (noOptionsInProduct) {
                yield Promise.all([product.save()]);
                return res.status(200).json({
                    message: "Product created successfully",
                    result: {
                        urls: productResult.data.urls || {},
                    },
                });
            }
            (() => __awaiter(this, void 0, void 0, function* () { return yield (0, exports.updateVariantFinalOption2)(product, access_token, tokenData); }))().then(() => __awaiter(this, void 0, void 0, function* () {
                if (subscription && subscription.products_limit) {
                    subscription = yield Subscription_model_1.Subscription.findOneAndUpdate({ _id: subscription._id }, { $inc: { products_limit: -1 } }, { new: true });
                }
                /*         await Promise.all([product?.save(), subscription?.save()]);
                        if(subscription)
                        WebSocketSender(subscription); */
                yield (product === null || product === void 0 ? void 0 : product.save());
                subscription === null || subscription === void 0 ? void 0 : subscription.save().then(updatedSubscription => {
                    if (updatedSubscription)
                        (0, WebSocketSender_1.WebSocketSender)(updatedSubscription);
                }).catch(err => {
                    // handle error
                    console.error(err);
                });
                // await Promise.all([product?.save()]);
                return res.status(200).json({
                    message: "Product created successfully",
                    result: {
                        urls: productResult.data.urls || {},
                    },
                });
            }));
        }
        catch (error) {
            const isAxiosError = error instanceof axios_1.AxiosError;
            const values = (_l = error === null || error === void 0 ? void 0 : error.response) === null || _l === void 0 ? void 0 : _l.data;
            console.log((_m = error === null || error === void 0 ? void 0 : error.response) === null || _m === void 0 ? void 0 : _m.data);
            console.log(error);
            console.log((_r = (_q = (_p = (_o = error === null || error === void 0 ? void 0 : error.response) === null || _o === void 0 ? void 0 : _o.data) === null || _p === void 0 ? void 0 : _p.error) === null || _q === void 0 ? void 0 : _q.fields) === null || _r === void 0 ? void 0 : _r.sku);
            console.log((_v = (_u = (_t = (_s = error === null || error === void 0 ? void 0 : error.response) === null || _s === void 0 ? void 0 : _s.data) === null || _t === void 0 ? void 0 : _t.error) === null || _u === void 0 ? void 0 : _u.fields) === null || _v === void 0 ? void 0 : _v.price);
            console.log((_z = (_y = (_x = (_w = error === null || error === void 0 ? void 0 : error.response) === null || _w === void 0 ? void 0 : _w.data) === null || _x === void 0 ? void 0 : _x.error) === null || _y === void 0 ? void 0 : _y.fields) === null || _z === void 0 ? void 0 : _z.visibility_condition_type);
            console.log((_3 = (_2 = (_1 = (_0 = error === null || error === void 0 ? void 0 : error.response) === null || _0 === void 0 ? void 0 : _0.data) === null || _1 === void 0 ? void 0 : _1.error) === null || _2 === void 0 ? void 0 : _2.fields) === null || _3 === void 0 ? void 0 : _3.visibility_condition_option);
            console.log((_7 = (_6 = (_5 = (_4 = error === null || error === void 0 ? void 0 : error.response) === null || _4 === void 0 ? void 0 : _4.data) === null || _5 === void 0 ? void 0 : _5.error) === null || _6 === void 0 ? void 0 : _6.fields) === null || _7 === void 0 ? void 0 : _7.visibility_condition_value);
            console.log((_11 = (_10 = (_9 = (_8 = error === null || error === void 0 ? void 0 : error.response) === null || _8 === void 0 ? void 0 : _8.data) === null || _9 === void 0 ? void 0 : _9.error) === null || _10 === void 0 ? void 0 : _10.fields) === null || _11 === void 0 ? void 0 : _11["options.0.name"]);
            console.log((_15 = (_14 = (_13 = (_12 = error === null || error === void 0 ? void 0 : error.response) === null || _12 === void 0 ? void 0 : _12.data) === null || _13 === void 0 ? void 0 : _13.error) === null || _14 === void 0 ? void 0 : _14.fields) === null || _15 === void 0 ? void 0 : _15["options.0.values.0.name"]);
            console.log((_19 = (_18 = (_17 = (_16 = error === null || error === void 0 ? void 0 : error.response) === null || _16 === void 0 ? void 0 : _16.data) === null || _17 === void 0 ? void 0 : _17.error) === null || _18 === void 0 ? void 0 : _18.fields) === null || _19 === void 0 ? void 0 : _19.metadata_title);
            next(isAxiosError ? new appError_1.default(values, 400) : error);
        }
    });
}
exports.LinkProductSalla2 = LinkProductSalla2;
