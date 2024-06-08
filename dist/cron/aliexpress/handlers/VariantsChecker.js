"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsVariantsDifferent = exports.IsQuantityDifferent = exports.IsPriceDifferent = void 0;
const IsPriceDifferent = (product, findProduct) => {
    var _a, _b, _c, _d, _e, _f;
    let findProdVarLength = (_a = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _a === void 0 ? void 0 : _a.length;
    let oldProdVarLength = (_b = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _b === void 0 ? void 0 : _b.length;
    if (oldProdVarLength !== findProdVarLength) {
        return true;
    }
    for (let i = 0; i < findProdVarLength; i++) {
        let findProdPriceCurrVariant = Number((_d = (_c = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _c === void 0 ? void 0 : _c[i]) === null || _d === void 0 ? void 0 : _d.offer_sale_price);
        let oldProdPriceCurrVariant = Number((_f = (_e = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _e === void 0 ? void 0 : _e[i]) === null || _f === void 0 ? void 0 : _f.offer_sale_price);
        if (findProdPriceCurrVariant !== oldProdPriceCurrVariant) {
            return true;
        }
    }
    return false;
};
exports.IsPriceDifferent = IsPriceDifferent;
//
const IsQuantityDifferent = (product, findProduct) => {
    var _a, _b, _c, _d, _e, _f;
    let findProdVarLength = (_a = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _a === void 0 ? void 0 : _a.length;
    let oldProdVarLength = (_b = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _b === void 0 ? void 0 : _b.length;
    if (oldProdVarLength !== findProdVarLength) {
        return true;
    }
    for (let i = 0; i < findProdVarLength; i++) {
        let findProdQuantityCurrVariant = Number((_d = (_c = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _c === void 0 ? void 0 : _c[i]) === null || _d === void 0 ? void 0 : _d.sku_available_stock);
        let oldProdQuantityCurrVariant = Number((_f = (_e = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _e === void 0 ? void 0 : _e[i]) === null || _f === void 0 ? void 0 : _f.sku_available_stock);
        if (findProdQuantityCurrVariant !== oldProdQuantityCurrVariant) {
            return true;
        }
    }
    return false;
};
exports.IsQuantityDifferent = IsQuantityDifferent;
const IsVariantsDifferent = (product, findProduct) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    let findProdVarLength = (_a = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _a === void 0 ? void 0 : _a.length;
    let oldProdVarLength = (_b = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _b === void 0 ? void 0 : _b.length;
    if (oldProdVarLength !== findProdVarLength) {
        return true;
    }
    for (let i = 0; i < findProdVarLength; i++) {
        let findProdQuantityCurrVariant = Number((_d = (_c = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _c === void 0 ? void 0 : _c[i]) === null || _d === void 0 ? void 0 : _d.sku_available_stock);
        let oldProdQuantityCurrVariant = Number((_f = (_e = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _e === void 0 ? void 0 : _e[i]) === null || _f === void 0 ? void 0 : _f.sku_available_stock);
        let findProdPriceCurrVariant = Number((_h = (_g = findProduct === null || findProduct === void 0 ? void 0 : findProduct.variantsArr) === null || _g === void 0 ? void 0 : _g[i]) === null || _h === void 0 ? void 0 : _h.offer_sale_price);
        let oldProdPriceCurrVariant = Number((_k = (_j = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _j === void 0 ? void 0 : _j[i]) === null || _k === void 0 ? void 0 : _k.offer_sale_price);
        let priceCondition = oldProdPriceCurrVariant !== findProdPriceCurrVariant;
        let quantityCondition = findProdQuantityCurrVariant !== oldProdQuantityCurrVariant &&
            oldProdQuantityCurrVariant <= 50;
        if (priceCondition || quantityCondition) {
            return true;
        }
    }
    return false;
};
exports.IsVariantsDifferent = IsVariantsDifferent;
