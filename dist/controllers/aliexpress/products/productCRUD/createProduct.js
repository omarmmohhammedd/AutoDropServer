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
exports.CreateAndSaveProduct = void 0;
const axios_1 = __importStar(require("axios"));
const appError_1 = __importDefault(require("../../../../utils/appError"));
const product_model_1 = require("../../../../models/product.model");
const lodash_1 = require("lodash");
const attachShippingInfoToProuct = (docId, productId, req) => __awaiter(void 0, void 0, void 0, function* () {
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const product = yield product_model_1.Product.findById(docId);
            const token = req.headers["authorization"];
            console.log(productId);
            if (product) {
                const getShippingInfo = {
                    url: process.env.Backend_Link + "aliexpress/getShippingDetails",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    data: {
                        product_id: productId,
                    },
                };
                const resp = yield axios_1.default.request(getShippingInfo);
                console.log(resp.data.shipping);
                product.shipping = resp.data.shipping;
                yield product.save();
            }
        }
        catch (error) {
            console.log((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
        }
    }), 2000);
});
function CreateAndSaveProduct(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { role, _id } = req.user;
            const { first_level_category_name, second_level_category_name, target_sale_price, target_original_price, variantsArr, } = req.body;
            console.log(req.body.variantsArr);
            let _d = (0, lodash_1.pick)(req.body, [
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
            ]), { merchant, vendor_commission, main_price, metadata_title, metadata_description, name, price } = _d, body = __rest(_d, ["merchant", "vendor_commission", "main_price", "metadata_title", "metadata_description", "name", "price"]);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            console.log('vendor_commission', vendor_commission);
            if (price < main_price) {
                [price, main_price] = [main_price, price];
            }
            const product = new product_model_1.Product(Object.assign(Object.assign({ name: name }, body), { price,
                vendor_commission,
                main_price, merchant: role === "client" ? _id : merchant, sku_id: req.body.sku_id, vat: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.vat) && true, first_level_category_name,
                second_level_category_name,
                target_sale_price,
                target_original_price,
                variantsArr }));
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
            // let { category_id, category_name } = req.body;
            // product.category_name = category_names;
            // product.category_id = category_id;
            const jsonProduct = product.toJSON();
            /*     const valuesStock = new Array().concat(
              //@ts-ignore
              ...jsonProduct.options?.map((option: any) => option.values)
            ); */
            /*     if (valuesStock.length > 100)
              throw new AppError("Values count should be smaller than 100", 400); */
            yield product.save();
            res.status(201).json({ product, success: true });
            attachShippingInfoToProuct(product._id.toString(), product.original_product_id, req);
        }
        catch (error) {
            const isAxiosError = error instanceof axios_1.AxiosError;
            const values = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data;
            console.log(error + "\n\n\n");
            console.log(values);
            console.log(values.error.fields);
            next(isAxiosError ? new appError_1.default("UnprocessableEntity " + values, 400) : error);
        }
    });
}
exports.CreateAndSaveProduct = CreateAndSaveProduct;
