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
exports.ProductSallaChecker = void 0;
const axios_1 = __importDefault(require("axios"));
const LinkProduct_1 = require("../LinkProduct");
function AlreadyLinkedProduct(sku, token, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let optDeleteProductBySku = {
            method: "DELETE",
            url: `https://api.salla.dev/admin/v2/products/sku/${sku}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            let { data: skuResp } = yield axios_1.default.request(optDeleteProductBySku);
            let status = skuResp === null || skuResp === void 0 ? void 0 : skuResp.status;
            // let code = skuResp?.code
            let dataCode = (_a = skuResp === null || skuResp === void 0 ? void 0 : skuResp.data) === null || _a === void 0 ? void 0 : _a.code;
            let success = skuResp === null || skuResp === void 0 ? void 0 : skuResp.success;
            console.log(skuResp === null || skuResp === void 0 ? void 0 : skuResp.status);
            // console.log(skuResp?.code)
            console.log((_b = skuResp === null || skuResp === void 0 ? void 0 : skuResp.data) === null || _b === void 0 ? void 0 : _b.code);
            console.log(success);
            if (success) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (err) {
            console.log((_c = err === null || err === void 0 ? void 0 : err.response) === null || _c === void 0 ? void 0 : _c.data);
            if (next) {
                return next(err);
            }
            return;
        }
    });
}
exports.default = AlreadyLinkedProduct;
const ProductSallaChecker = (optionsObj, sku, token, req, res, next, product) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25;
    // console.log(optionsObj);
    try {
        let { data } = yield axios_1.default.request(optionsObj);
        return data;
    }
    catch (err) {
        const axiosError = err;
        console.log((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data);
        let status = (_c = (_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.status;
        let success = (_e = (_d = err === null || err === void 0 ? void 0 : err.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.success;
        let errorFieldSku = (_j = (_h = (_g = (_f = err === null || err === void 0 ? void 0 : err.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.error) === null || _h === void 0 ? void 0 : _h.fields) === null || _j === void 0 ? void 0 : _j.sku;
        let priceErr = (_o = (_m = (_l = (_k = err === null || err === void 0 ? void 0 : err.response) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.error) === null || _m === void 0 ? void 0 : _m.fields) === null || _o === void 0 ? void 0 : _o.price;
        let nameErr = (_s = (_r = (_q = (_p = err === null || err === void 0 ? void 0 : err.response) === null || _p === void 0 ? void 0 : _p.data) === null || _q === void 0 ? void 0 : _q.error) === null || _r === void 0 ? void 0 : _r.fields) === null || _s === void 0 ? void 0 : _s.name;
        let options0valeus10name = (_w = (_v = (_u = (_t = err === null || err === void 0 ? void 0 : err.response) === null || _t === void 0 ? void 0 : _t.data) === null || _u === void 0 ? void 0 : _u.error) === null || _v === void 0 ? void 0 : _v.fields) === null || _w === void 0 ? void 0 : _w["options.0.values.10.name"];
        let options1valeus0name = (_0 = (_z = (_y = (_x = err === null || err === void 0 ? void 0 : err.response) === null || _x === void 0 ? void 0 : _x.data) === null || _y === void 0 ? void 0 : _y.error) === null || _z === void 0 ? void 0 : _z.fields) === null || _0 === void 0 ? void 0 : _0["options.1.values.0.name"];
        let options1valeus1name = (_4 = (_3 = (_2 = (_1 = err === null || err === void 0 ? void 0 : err.response) === null || _1 === void 0 ? void 0 : _1.data) === null || _2 === void 0 ? void 0 : _2.error) === null || _3 === void 0 ? void 0 : _3.fields) === null || _4 === void 0 ? void 0 : _4["options.1.values.1.name"];
        let visibility_condition_type = (_8 = (_7 = (_6 = (_5 = err === null || err === void 0 ? void 0 : err.response) === null || _5 === void 0 ? void 0 : _5.data) === null || _6 === void 0 ? void 0 : _6.error) === null || _7 === void 0 ? void 0 : _7.fields) === null || _8 === void 0 ? void 0 : _8.visibility_condition_type;
        let visibility_condition_option = (_12 = (_11 = (_10 = (_9 = err === null || err === void 0 ? void 0 : err.response) === null || _9 === void 0 ? void 0 : _9.data) === null || _10 === void 0 ? void 0 : _10.error) === null || _11 === void 0 ? void 0 : _11.fields) === null || _12 === void 0 ? void 0 : _12.visibility_condition_option;
        let visibility_condition_value = (_16 = (_15 = (_14 = (_13 = err === null || err === void 0 ? void 0 : err.response) === null || _13 === void 0 ? void 0 : _13.data) === null || _14 === void 0 ? void 0 : _14.error) === null || _15 === void 0 ? void 0 : _15.fields) === null || _16 === void 0 ? void 0 : _16.visibility_condition_value;
        console.log("sallaCreateProductErrorData", (_17 = err === null || err === void 0 ? void 0 : err.response) === null || _17 === void 0 ? void 0 : _17.data);
        console.log("sallaCreateProductError", (_19 = (_18 = err === null || err === void 0 ? void 0 : err.response) === null || _18 === void 0 ? void 0 : _18.data) === null || _19 === void 0 ? void 0 : _19.error);
        if (options1valeus0name) {
            console.log("options1valeus0name", options1valeus0name);
        }
        if (options1valeus1name) {
            console.log("options1valeus1name", options1valeus1name);
        }
        if (options0valeus10name) {
            console.log("options0valeus10name", options0valeus10name);
        }
        if (visibility_condition_type) {
            console.log("visibility_condition_type", visibility_condition_type);
        }
        if (visibility_condition_option) {
            console.log("visibility_condition_option", visibility_condition_option);
        }
        if (visibility_condition_value) {
            console.log("visibility_condition_value", visibility_condition_value);
        }
        if (nameErr) {
            console.log("nameErr", nameErr);
        }
        if (priceErr) {
            console.log("priceErr", priceErr);
        }
        if (status) {
            console.log("status", status);
        }
        if (success) {
            console.log("success", success);
        }
        if (errorFieldSku) {
            console.log("errorFieldSku", errorFieldSku);
        }
        console.log(status == 422 && success == false && ((_20 = errorFieldSku === null || errorFieldSku === void 0 ? void 0 : errorFieldSku[0]) === null || _20 === void 0 ? void 0 : _20.includes("SKU")));
        if (visibility_condition_type &&
            visibility_condition_option &&
            visibility_condition_value &&
            res &&
            next) {
            /*       if (product){} */
            let productObj = product.toObject();
            let optionsLastElementIndex = ((_21 = productObj === null || productObj === void 0 ? void 0 : productObj.options) === null || _21 === void 0 ? void 0 : _21.length) - 1;
            let valuesLengthLastOption = ((_24 = (_23 = (_22 = productObj === null || productObj === void 0 ? void 0 : productObj.options) === null || _22 === void 0 ? void 0 : _22[optionsLastElementIndex]) === null || _23 === void 0 ? void 0 : _23.values) === null || _24 === void 0 ? void 0 : _24.length) - 1;
            if (typeof optionsLastElementIndex === "number" &&
                typeof valuesLengthLastOption === "number") {
                productObj.options[optionsLastElementIndex].values = productObj.options[optionsLastElementIndex].values.slice(0, valuesLengthLastOption);
            }
            product.options = productObj.options;
            yield product.save();
            console.log("product.options", product.options);
            yield (0, LinkProduct_1.LinkProductSalla2)(req, res, next);
            return { message: "Cancel" };
        }
        if (status == 422 &&
            success == false &&
            ((_25 = errorFieldSku === null || errorFieldSku === void 0 ? void 0 : errorFieldSku[0]) === null || _25 === void 0 ? void 0 : _25.includes("SKU"))) {
            console.log("SKU is already linked to a product on Salla");
            let successFullUnLink = yield AlreadyLinkedProduct(sku, token, next);
            console.log("1111");
            console.log(successFullUnLink);
            if (successFullUnLink) {
                // Call LinkProductSalla2 again
                console.log("2222");
                if (res && next) {
                    yield (0, LinkProduct_1.LinkProductSalla2)(req, res, next);
                    return { message: "Cancel" };
                }
                else {
                    // Handle the case where res is undefined
                    console.error("res/next is undefined");
                }
                return { message: "Error" };
            }
            return { message: "Error" };
        }
        // throw new AppError("sku already linked to a product on Salla", 400);
    }
});
exports.ProductSallaChecker = ProductSallaChecker;
