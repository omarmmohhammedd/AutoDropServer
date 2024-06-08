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
exports.getProductSkus = exports.updateVariantFinalOption = exports.UpdateProductVariantSale = exports.UpdateProductVariant = exports.getProductVariants = exports.CreateProductControllerOld = exports.CreateProductController = void 0;
//@ts-nocheck
const axios_1 = __importStar(require("axios"));
const lodash_1 = require("lodash");
const appError_1 = __importDefault(require("../../../../utils/appError"));
const product_model_1 = require("../../../../models/product.model");
const SallaTokenModel_1 = __importDefault(require("../../../../models/SallaTokenModel"));
const Request_1 = __importDefault(require("../../features/Request"));
const AliExpressTokenModel_1 = __importDefault(require("../../../../models/AliExpressTokenModel"));
function CreateProductController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const { role, _id } = req.user;
            const sallaTokenDocument = yield SallaTokenModel_1.default.findOne({
                _id: req.user.sallaToken,
            });
            let { accessToken } = sallaTokenDocument;
            let token = accessToken;
            let access_token = accessToken;
            let _h = (0, lodash_1.pick)(req.body, [
                "name",
                "description",
                "vendor_commission",
                "main_price",
                "price",
                "quantity",
                "sku",
                "images",
                "options",
                "metadata_title",
                "metadata_description",
                "product_type",
                "original_product_id",
                "merchant",
            ]), { merchant, vendor_commission, main_price, metadata_title, metadata_description, name, price } = _h, body = __rest(_h, ["merchant", "vendor_commission", "main_price", "metadata_title", "metadata_description", "name", "price"]);
            if (price < main_price) {
                [price, main_price] = [main_price, price];
            }
            const product = new product_model_1.Product(Object.assign(Object.assign({ name: name }, body), { price,
                vendor_commission,
                main_price, merchant: role === "client" ? _id : merchant, sku_id: req.body.sku_id, vat: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.vat) && true }));
            console.log(vendor_commission);
            console.log(vendor_commission);
            console.log(vendor_commission);
            console.log(vendor_commission);
            const vendor_price = parseFloat(((main_price * vendor_commission) / 100).toFixed(2));
            product.vendor_price = vendor_price;
            product.vendor_commission = vendor_commission;
            product.metadata_title = metadata_title;
            product.metadata_description = metadata_description;
            const options = (_b = body === null || body === void 0 ? void 0 : body.options) === null || _b === void 0 ? void 0 : _b.map((option) => {
                const values = option.values;
                return Object.assign(Object.assign({}, option), { values: values === null || values === void 0 ? void 0 : values.map((value) => {
                        const valuePrice = value.original_price;
                        const vendorOptionPrice = parseFloat((valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2));
                        return Object.assign(Object.assign({}, value), { original_price: valuePrice, price: vendorOptionPrice });
                    }) });
            });
            product.options = options;
            const options_1 = {
                method: "POST",
                url: "https://api.salla.dev/admin/v2/products",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    name: product.name,
                    price: product.price,
                    product_type: product.product_type,
                    quantity: product.quantity,
                    description: product.description,
                    cost_price: product.main_price,
                    require_shipping: product.require_shipping,
                    sku: product.sku,
                    images: product.images,
                    options: product.options,
                    metadata_title,
                    metadata_description,
                },
            };
            const jsonProduct = product.toJSON();
            /*     const valuesStock = new Array().concat(
              //@ts-ignore
              ...jsonProduct.options?.map((option: any) => option.values)
            );
            if (valuesStock.length > 100)
              throw new AppError("Values count should be smaller than 100", 400); */
            const { data: productResult } = yield axios_1.default.request(options_1);
            product.salla_product_id = (_c = productResult.data) === null || _c === void 0 ? void 0 : _c.id;
            console.log((_d = productResult.data) === null || _d === void 0 ? void 0 : _d.id);
            // let SentOptionsResolved = [];
            const getVariantsIds = {
                method: "GET",
                url: `https://api.salla.dev/admin/v2/products/${(_e = productResult.data) === null || _e === void 0 ? void 0 : _e.id}/variants`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            let variants = yield axios_1.default.request(getVariantsIds);
            let res = [];
            for (let [index, VarEl] of variants.data.data.entries()) {
                console.log(VarEl.id);
                let op = product.options.map((option) => option.values).flat();
                // console.log(op);
                console.log(op.length);
                console.log(variants.data.data.length);
                if (index >= op.length) {
                    console.log("index out of range");
                    break;
                }
                let { sku, price, quantity, original_price } = op[index];
                let varUpdate = {
                    method: "PUT",
                    url: `https://api.salla.dev/admin/v2/products/variants/${VarEl.id}?sku=${sku}`,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: {
                        // sku,
                        price,
                        stock_quantity: quantity,
                        sale_price: price,
                    },
                };
                console.log("first variant added with sku", sku);
                res.push(axios_1.default.request(varUpdate));
                //
            }
            console.log("done updating price");
            // update quantity
            let res2 = [];
            for (let [index, VarEl] of variants.data.data.entries()) {
                console.log(VarEl.id);
                let op = product.options.map((option) => option.values).flat();
                if (index >= op.length) {
                    console.log("index out of range");
                    break;
                }
                let { quantity } = op[index];
                console.log(op[index]);
                let varUpdate = {
                    method: "PUT",
                    url: `https://api.salla.dev/admin/v2/products/quantities/variant/${VarEl.id}`,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: {
                        quantity,
                    },
                };
                res2.push(axios_1.default.request(varUpdate));
                //
            }
            // console.log(variants);
            console.log("done updating quantity");
            let respData = yield Promise.all(res);
            let respData2 = yield Promise.all(res2);
            console.log(respData);
            console.log(respData2);
            return;
            //
            /*     for (let option of product.options) {
              for (let value of option.values) {
              }
              let options2 = {
                method: "POST",
                url: `https://api.salla.dev/admin/v2/products/${productResult.data?.id}/options`,
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
                data: {
                  display_type: option.display_type,
                  name: option.name,
                  values: [option.values[0]],
                },
              };
        
              let response = await axios.request(options2);
              SentOptionsResolved.push(response);
            } */
            // let resolvedOptions = await Promise.all(SentOptionsResolved);
            /*     let optionsIds = resolvedOptions.map((option: any) => {
              return option.data.data.id;
            }); */
            try {
                // let res2 = await Promise.all(valuseSent.flat());
                // console.log(res2);
                console.log("success");
            }
            catch (e) {
                //console.log(e);
                //console.log(e.data.error.fields.values);
                // console.log(e.response.data.error.fields);
                console.log(e.response);
            }
            return;
            product.options = yield Promise.all(
            // @ts-ignore
            (_f = jsonProduct.options) === null || _f === void 0 ? void 0 : _f.map((option, index) => __awaiter(this, void 0, void 0, function* () {
                let obj = option;
                const productOption = productResult.data.options[index];
                const values = yield Promise.all(option.values.map((value, idx) => __awaiter(this, void 0, void 0, function* () {
                    const optionValue = productOption === null || productOption === void 0 ? void 0 : productOption.values[idx];
                    const mnp = getRandomInt(100000000000000, 999999999999999);
                    const gitin = getRandomInt(10000000000000, 99999999999999);
                    console.log(optionValue.id);
                    // console.log(optionValue.id);
                    return Object.assign(Object.assign({}, value), { mpn: mnp, gtin: gitin });
                })));
                obj.salla_option_id = productOption === null || productOption === void 0 ? void 0 : productOption.id;
                obj.values = values;
            })));
            console.log(productResult.data.id);
            const finalOptions = yield Promise.all(
            //@ts-ignore
            jsonProduct.options.map((option, idx) => __awaiter(this, void 0, void 0, function* () {
                const values = yield Promise.all(option.values.map((optionValue, i) => __awaiter(this, void 0, void 0, function* () {
                    var _j;
                    const variants = (yield allVaraint(productResult.data.id, token)) || [];
                    const variant = variants.find((item) => { var _a; return (_a = item.related_option_values) === null || _a === void 0 ? void 0 : _a.includes(optionValue.salla_value_id); });
                    const mnp = getRandomInt(100000000000000, 999999999999999);
                    const gitin = getRandomInt(10000000000000, 99999999999999);
                    const { price, quantity, mpn, gtin, sku, id, sku_id } = optionValue;
                    const barcode = [mnp, gitin].join("");
                    if (!variant)
                        return optionValue;
                    let result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku_id, access_token);
                    if (!result) {
                        result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku_id, access_token);
                    }
                    return Object.assign(Object.assign({}, optionValue), { salla_variant_id: (_j = result === null || result === void 0 ? void 0 : result.data) === null || _j === void 0 ? void 0 : _j.id });
                })));
                return Object.assign(Object.assign({}, option), { values });
            })));
            let aliexpressDoc = yield AliExpressTokenModel_1.default.findById(req.user.aliExpressToken);
            let tokenData = {
                aliExpressAccessToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.accessToken,
                aliExpressRefreshToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.refreshToken,
            };
            product.options = finalOptions;
            (() => __awaiter(this, void 0, void 0, function* () { return yield (0, exports.updateVariantFinalOption)(product, access_token, tokenData); }))().then(() => __awaiter(this, void 0, void 0, function* () {
                /*         if (subscription.products_limit)
                  subscription.products_limit = subscription.products_limit - 1; */
                // await Promise.all([product.save(), subscription.save()]);
                yield product.save();
                res.status(200).json({
                    message: "Product created successfully",
                    result: {
                        urls: productResult.data.urls || {},
                    },
                });
            }));
        }
        catch (error) {
            const isAxiosError = error instanceof axios_1.AxiosError;
            const values = (_g = error === null || error === void 0 ? void 0 : error.response) === null || _g === void 0 ? void 0 : _g.data;
            console.log(error + "\n\n\n");
            console.log(values);
            console.log(values.error.fields);
            next(isAxiosError ? new appError_1.default("UnprocessableEntity " + values, 400) : error);
        }
    });
}
exports.CreateProductController = CreateProductController;
function CreateProductControllerOld(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            //   let token: string | undefined, account: UserDocument | null;
            //   let subscription: SubscriptionDocument | null;
            //console.log(req.user);
            /*     console.log(req.user._id.toString());
             */
            const { role, _id } = req.user;
            /*     console.log(req.user.aliExpressToken);
            console.log(req.user.sallaToken);
            console.log(req.user.role); */
            const sallaTokenDocument = yield SallaTokenModel_1.default.findOne({
                _id: req.user.sallaToken,
            });
            let { accessToken } = sallaTokenDocument;
            let token = accessToken;
            let access_token = accessToken;
            // console.log(access_token);
            // console.log(token);
            // console.log(req.user.sallaToken);
            /*    const { access_token, user_id, userType } = pick(req.local, [
              "user_id",
              "access_token",
              "userType",
            ]);
         */
            let _f = (0, lodash_1.pick)(req.body, [
                "name",
                "description",
                "vendor_commission",
                "main_price",
                "price",
                "quantity",
                "sku",
                "images",
                "options",
                "metadata_title",
                "metadata_description",
                "product_type",
                "original_product_id",
                "merchant",
            ]), { merchant, vendor_commission, main_price, metadata_title, metadata_description, name, price } = _f, body = __rest(_f, ["merchant", "vendor_commission", "main_price", "metadata_title", "metadata_description", "name", "price"]);
            if (price < main_price) {
                [price, main_price] = [main_price, price];
            }
            console.log(name);
            /*   subscription = await CheckSubscription(
              userType === "vendor" ? user_id : merchant,
              "products_limit"
            ); */
            const product = new product_model_1.Product(Object.assign(Object.assign({ name: name }, body), { price,
                vendor_commission,
                main_price, merchant: role === "client" ? _id : merchant, sku_id: req.body.sku_id, vat: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.vat) && true }));
            const vendor_price = parseFloat(((main_price * vendor_commission) / 100).toFixed(2));
            product.vendor_price = vendor_price;
            product.vendor_commission = vendor_commission;
            product.metadata_title = metadata_title;
            product.metadata_description = metadata_description;
            const options = (_b = body === null || body === void 0 ? void 0 : body.options) === null || _b === void 0 ? void 0 : _b.map((option) => {
                const values = option.values;
                return Object.assign(Object.assign({}, option), { values: values === null || values === void 0 ? void 0 : values.map((value) => {
                        const valuePrice = value.original_price;
                        const vendorOptionPrice = parseFloat((valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2));
                        return Object.assign(Object.assign({}, value), { original_price: valuePrice, price: vendorOptionPrice });
                    }) });
            });
            product.options = options;
            // token = access_token;
            /*  if (userType === "admin") {
              account = await User.findOne({
                _id: merchant,
                userType: "vendor",
              }).exec();
            } */
            const options_1 = {
                method: "POST",
                url: "https://api.salla.dev/admin/v2/products",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    name: product.name,
                    price: product.price,
                    product_type: product.product_type,
                    quantity: product.quantity,
                    description: product.description,
                    cost_price: product.main_price,
                    require_shipping: product.require_shipping,
                    sku: product.sku,
                    images: product.images,
                    options: product.options,
                    metadata_title,
                    metadata_description,
                },
            };
            const jsonProduct = product.toJSON();
            console.log(token);
            /*     const valuesStock = new Array().concat(
              //@ts-ignore
              ...jsonProduct.options?.map((option: any) => option.values)
            );
            if (valuesStock.length > 100)
              throw new AppError("Values count should be smaller than 100", 400); */
            const { data: productResult } = yield axios_1.default.request(options_1);
            // console.log(productResult);
            //    console.log(productResult.data.options);
            console.log(productResult.data.id);
            product.options = yield Promise.all(
            // @ts-ignore
            (_c = jsonProduct.options) === null || _c === void 0 ? void 0 : _c.map((option, index) => __awaiter(this, void 0, void 0, function* () {
                let obj = option;
                const productOption = productResult.data.options[index];
                const values = yield Promise.all(option.values.map((value, idx) => __awaiter(this, void 0, void 0, function* () {
                    const optionValue = productOption === null || productOption === void 0 ? void 0 : productOption.values[idx];
                    const mnp = getRandomInt(100000000000000, 999999999999999);
                    const gitin = getRandomInt(10000000000000, 99999999999999);
                    console.log(optionValue.id);
                    // console.log(optionValue.id);
                    return Object.assign(Object.assign({}, value), { mpn: mnp, gtin: gitin, 
                        // salla_value_id: value?.id,
                        salla_value_id: optionValue === null || optionValue === void 0 ? void 0 : optionValue.id });
                })));
                obj.salla_option_id = productOption === null || productOption === void 0 ? void 0 : productOption.id;
                obj.values = values;
            })));
            console.log(productResult.data.id);
            const finalOptions = yield Promise.all(
            //@ts-ignore
            jsonProduct.options.map((option, idx) => __awaiter(this, void 0, void 0, function* () {
                const values = yield Promise.all(option.values.map((optionValue, i) => __awaiter(this, void 0, void 0, function* () {
                    var _g;
                    const variants = (yield allVaraint(productResult.data.id, token)) || [];
                    const variant = variants.find((item) => { var _a; return (_a = item.related_option_values) === null || _a === void 0 ? void 0 : _a.includes(optionValue.salla_value_id); });
                    const mnp = getRandomInt(100000000000000, 999999999999999);
                    const gitin = getRandomInt(10000000000000, 99999999999999);
                    const { price, quantity, mpn, gtin, sku, id, sku_id } = optionValue;
                    const barcode = [mnp, gitin].join("");
                    if (!variant)
                        return optionValue;
                    let result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku_id, access_token);
                    if (!result) {
                        result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku_id, access_token);
                    }
                    return Object.assign(Object.assign({}, optionValue), { salla_variant_id: (_g = result === null || result === void 0 ? void 0 : result.data) === null || _g === void 0 ? void 0 : _g.id });
                })));
                return Object.assign(Object.assign({}, option), { values });
            })));
            let aliexpressDoc = yield AliExpressTokenModel_1.default.findById(req.user.aliExpressToken);
            let tokenData = {
                aliExpressAccessToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.accessToken,
                aliExpressRefreshToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.refreshToken,
            };
            product.options = finalOptions;
            product.salla_product_id = (_d = productResult.data) === null || _d === void 0 ? void 0 : _d.id;
            (() => __awaiter(this, void 0, void 0, function* () { return yield (0, exports.updateVariantFinalOption)(product, access_token, tokenData); }))().then(() => __awaiter(this, void 0, void 0, function* () {
                /*         if (subscription.products_limit)
                  subscription.products_limit = subscription.products_limit - 1; */
                // await Promise.all([product.save(), subscription.save()]);
                yield product.save();
                res.status(200).json({
                    message: "Product created successfully",
                    result: {
                        urls: productResult.data.urls || {},
                    },
                });
            }));
        }
        catch (error) {
            const isAxiosError = error instanceof axios_1.AxiosError;
            const values = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data;
            console.log(error + "\n\n\n");
            console.log(values);
            next(isAxiosError ? new appError_1.default("UnprocessableEntity " + values, 400) : error);
        }
    });
}
exports.CreateProductControllerOld = CreateProductControllerOld;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
const getProductVariants = (id, pages, access_token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log("access_token", access_token);
    console.log("access_token", access_token);
    console.log("id", id);
    // console.log("pages", pages);
    const options = {
        method: "GET",
        url: `https://api.salla.dev/admin/v2/products/${id}/variants?page=${pages}`,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${access_token}`,
        },
    };
    try {
        const { data } = yield axios_1.default.request(options);
        console.log("variantsData", data);
        if (data.status === 200) {
            return data;
        }
        else
            return;
    }
    catch (error) {
        console.log(error);
        console.log((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error);
        console.log((_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error);
    }
});
exports.getProductVariants = getProductVariants;
const allVaraint = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    let all = [];
    yield (0, exports.getProductVariants)(id, 1, token).then((variantResult) => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        if (variantResult) {
            if (((_e = variantResult === null || variantResult === void 0 ? void 0 : variantResult.pagination) === null || _e === void 0 ? void 0 : _e.totalPages) > 1) {
                for (let i = 0; i < variantResult.pagination.totalPages; i++) {
                    const vr = yield (0, exports.getProductVariants)(id, i + 1, token);
                    all.push(...vr.data);
                }
            }
            else {
                all.push(...variantResult.data);
            }
        }
    }));
    return all;
});
const UpdateProductVariant = (variantId, barcode, price, stock_quantity, mpn, gtin, sku, token) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j, _k, _l;
    const options = {
        method: "PUT",
        url: `https://api.salla.dev/admin/v2/products/variants/${variantId}`,
        params: {
            sku,
            barcode,
            price,
            stock_quantity,
        },
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        data: {
            sku,
            barcode,
            price,
            stock_quantity,
            mpn,
            gtin,
        },
    };
    try {
        const { data } = yield axios_1.default.request(options);
        return data;
    }
    catch (error) {
        if ((_h = (_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.error) === null || _h === void 0 ? void 0 : _h.fields) {
            console.log((_k = (_j = error.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.error.fields);
        }
        else {
            console.log((_l = error.response) === null || _l === void 0 ? void 0 : _l.data);
        }
    }
});
exports.UpdateProductVariant = UpdateProductVariant;
const UpdateProductVariantSale = (variantId, barcode, price, stock_quantity, mpn, gtin, sku, token, sale_price) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o, _p, _q, _r, _s;
    const options = {
        method: "PUT",
        url: `https://api.salla.dev/admin/v2/products/variants/${variantId}`,
        params: {
            sku,
            barcode,
            price,
            stock_quantity,
            sale_price,
        },
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        data: {
            sku,
            barcode,
            price,
            stock_quantity,
            mpn,
            gtin,
            sale_price,
        },
    };
    try {
        const { data } = yield axios_1.default.request(options);
        return data;
    }
    catch (error) {
        if ((_p = (_o = (_m = error.response) === null || _m === void 0 ? void 0 : _m.data) === null || _o === void 0 ? void 0 : _o.error) === null || _p === void 0 ? void 0 : _p.fields) {
            console.log((_r = (_q = error.response) === null || _q === void 0 ? void 0 : _q.data) === null || _r === void 0 ? void 0 : _r.error.fields);
        }
        else {
            console.log((_s = error.response) === null || _s === void 0 ? void 0 : _s.data);
        }
    }
});
exports.UpdateProductVariantSale = UpdateProductVariantSale;
const updateVariantFinalOption = (product, token, tokenData) => __awaiter(void 0, void 0, void 0, function* () {
    const jsonProduct = product.toJSON();
    const data = yield (0, exports.getProductVariants)(product.salla_product_id, 1, token);
    if (data.pagination.totalPages > 1) {
        for (let i = 0; i < data.pagination.totalPages; i++) {
            const vr = yield (0, exports.getProductVariants)(product.salla_product_id, i + 1, token);
            const variants = vr.data.filter((e) => !e.sku);
            if (!variants.length)
                return;
            yield Promise.all(variants.map((variant) => __awaiter(void 0, void 0, void 0, function* () {
                if (!variant.sku) {
                    const salla_option_ids = variant.related_option_values;
                    const values = yield Promise.all(jsonProduct.options.map((option) => __awaiter(void 0, void 0, void 0, function* () {
                        const value = option.values.find((val) => salla_option_ids.includes(val === null || val === void 0 ? void 0 : val.salla_value_id));
                        return value;
                    })));
                    const getSkusId = (values) => __awaiter(void 0, void 0, void 0, function* () {
                        const skus = yield (0, exports.getProductSkus)(product.original_product_id, tokenData);
                        const keyWords = values.map((val) => val.name);
                        yield Promise.all(skus.map((sku) => __awaiter(void 0, void 0, void 0, function* () {
                            const skusOptions = sku.ae_sku_property_dtos.ae_sku_property_d_t_o;
                            const check = sku.ae_sku_property_dtos.ae_sku_property_d_t_o.filter((property, idx) => {
                                if (property.property_value_definition_name) {
                                    if (keyWords.includes(property.property_value_definition_name))
                                        return property;
                                }
                                else {
                                    if (keyWords.includes(property.sku_property_value) ||
                                        property.sku_property_name === "Ships From")
                                        return property;
                                }
                            });
                            if (check.length === skusOptions.length) {
                                const optionValue = values.find((val) => val.name === sku.id.split(";")[0].split("#")[1] ||
                                    val.sku === sku.id.split(";")[0]);
                                const { price, quantity } = optionValue;
                                let mnp = getRandomInt(100000000000000, 999999999999999);
                                let gitin = getRandomInt(10000000000000, 99999999999999);
                                let barcode = [mnp, gitin].join("");
                                let result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku.sku_id, token);
                                while (!result) {
                                    mnp = getRandomInt(100000000000000, 999999999999999);
                                    gitin = getRandomInt(10000000000000, 99999999999999);
                                    barcode = [mnp, gitin].join("");
                                    result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku.sku_id, token);
                                }
                            }
                        })));
                    });
                    yield getSkusId(values);
                }
            })));
        }
    }
    else {
        const variants = data.data.filter((e) => !e.sku);
        if (!variants.length)
            return;
        yield Promise.all(variants.map((variant) => __awaiter(void 0, void 0, void 0, function* () {
            if (!variant.sku) {
                // console.log(product.id,variant.id)
                const salla_option_ids = variant.related_option_values;
                const values = yield Promise.all(jsonProduct.options.map((option) => __awaiter(void 0, void 0, void 0, function* () {
                    const value = option.values.find((val) => salla_option_ids.includes(val.salla_value_id));
                    return value;
                })));
                const getSkusId = (values) => __awaiter(void 0, void 0, void 0, function* () {
                    const skus = yield (0, exports.getProductSkus)(product.original_product_id, tokenData);
                    console.log(values);
                    const keyWords = values.map((val) => val.name);
                    yield Promise.all(skus.map((sku) => __awaiter(void 0, void 0, void 0, function* () {
                        const skusOptions = sku.ae_sku_property_dtos.ae_sku_property_d_t_o;
                        const check = sku.ae_sku_property_dtos.ae_sku_property_d_t_o.filter((property, idx) => {
                            if (property.property_value_definition_name) {
                                if (keyWords.includes(property.property_value_definition_name))
                                    return property;
                            }
                            else {
                                if (keyWords.includes(property.sku_property_value) ||
                                    property.sku_property_name === "Ships From")
                                    return property;
                            }
                        });
                        if (check.length === skusOptions.length) {
                            const optionValue = values.find((val) => val.name === sku.id.split(";")[0].split("#")[1] ||
                                val.sku === sku.id.split(";")[0]);
                            const { price, quantity } = optionValue;
                            let mnp = getRandomInt(100000000000000, 999999999999999);
                            let gitin = getRandomInt(10000000000000, 99999999999999);
                            let barcode = [mnp, gitin].join("");
                            let result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku.sku_id, token);
                            while (!result) {
                                mnp = getRandomInt(100000000000000, 999999999999999);
                                gitin = getRandomInt(10000000000000, 99999999999999);
                                barcode = [mnp, gitin].join("");
                                result = yield (0, exports.UpdateProductVariant)(variant.id, barcode, price, quantity, mnp, gitin, sku.sku_id, token);
                                console.log(result);
                            }
                        }
                    })));
                });
                yield getSkusId(values);
            }
        })));
    }
});
exports.updateVariantFinalOption = updateVariantFinalOption;
const getProductSkus = (product_id, tokenData) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u;
    try {
        const response = yield (0, Request_1.default)({
            ship_to_country: "SA",
            product_id: product_id,
            target_currency: "SAR",
            target_language: "AR",
            method: "aliexpress.ds.product.get",
            sign_method: "sha256",
        }, tokenData);
        const aeResponse = response === null || response === void 0 ? void 0 : response.data;
        const result = (_t = aeResponse === null || aeResponse === void 0 ? void 0 : aeResponse.aliexpress_ds_product_get_response) === null || _t === void 0 ? void 0 : _t.result;
        const errorMessage = ((_u = aeResponse === null || aeResponse === void 0 ? void 0 : aeResponse.error_response) === null || _u === void 0 ? void 0 : _u.msg) ||
            "There is something went wrong while getting product details or maybe this product is not available for shipping to SA, try another product or contact support.";
        // console.log(result);
        if (!result) {
            console.log("notFound");
            console.log("lollolo");
        }
        else {
            const { ae_item_sku_info_dtos, ae_item_base_info_dto, ae_multimedia_info_dto, } = result;
            /* const chinaShippedProducts =
              ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.filter((product: any) => {
                let skus = product.ae_sku_property_dtos.ae_sku_property_d_t_o.some(
                  (prop: any) => {
                    return (
                      prop.sku_property_name === "Ships From" &&
                      prop.sku_property_value === "CHINA"
                    );
                  }
                );
                if (!skus.length) {
                  skus = product.ae_sku_property_dtos.ae_sku_property_d_t_o;
                }
                return skus;
              }); */
            //me
            const chinaShippedProducts = ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.filter((product) => {
                return product.ae_sku_property_dtos.ae_sku_property_d_t_o.some((prop) => {
                    return (prop.sku_property_name === "Ships From" &&
                        prop.sku_property_value === "CHINA");
                });
            });
            //
            /*    console.log(chinaShippedProducts);
            console.log(result.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o); */
            // console.log(result);
            // return uniqBy(chinaShippedProducts, "sku_id");
            return (0, lodash_1.uniqBy)(result.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o, "sku_id");
        }
    }
    catch (error) {
        console.error("Error fetching product SKUs:", error === null || error === void 0 ? void 0 : error.message);
        return [];
    }
});
exports.getProductSkus = getProductSkus;
