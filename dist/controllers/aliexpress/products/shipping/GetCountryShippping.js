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
exports.GetShippingProductIdCountryCode = exports.GetProductShippingDetailsByID = void 0;
const tokenUserExtractor_1 = __importDefault(require("../../../../utils/handlers/tokenUserExtractor"));
const AliExpressTokenModel_1 = __importDefault(require("../../../../models/AliExpressTokenModel"));
const GetProductsShipping_1 = require("./GetProductsShipping");
const shipping_1 = require("../../features/shipping");
const index_1 = require("../../features/shipping/index");
function GetProductShippingDetailsByID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { product_id } = req.body;
            let user = yield (0, tokenUserExtractor_1.default)(req);
            if (!user)
                return res.status(401).json({ message: "token is invalid" });
            let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
            let tokenInfo = {
                aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
                aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
            };
            /*     if (userType === "vendor")
                  await CheckSubscription(user_id, "products_limit"); */
            const skuid = yield (0, GetProductsShipping_1.GetSKUId)({ product_id, tokenInfo });
            let result = yield (0, shipping_1.getProductShippingServices)({
                sku_id: skuid,
                country_code: "SA",
                product_id,
                product_num: "1",
                price_currency: "SAR",
            }, tokenInfo);
            // console.log("result",result);
            if (!result) {
                result = [];
            }
            return res.json({ shipping: result });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    });
}
exports.GetProductShippingDetailsByID = GetProductShippingDetailsByID;
function GetShippingProductIdCountryCode(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { product_id, country_code } = req.body;
            let user = yield (0, tokenUserExtractor_1.default)(req);
            if (!user)
                return res.status(401).json({ message: "token is invalid" });
            console.log("country_code", country_code);
            let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
            let tokenInfo = {
                aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
                aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
            };
            /*     if (userType === "vendor")
                await CheckSubscription(user_id, "products_limit"); */
            const skuid = yield (0, GetProductsShipping_1.GetSKUId)({ product_id, tokenInfo });
            let result;
            try {
                result = yield (0, shipping_1.getProductShippingServices)({
                    sku_id: skuid,
                    country_code,
                    product_id,
                    product_num: "1",
                    price_currency: "SAR",
                }, tokenInfo);
            }
            catch (err) {
                console.error(err);
            }
            let queryDeliveryReq = {
                quantity: 1,
                shipToCountry: country_code,
                productId: product_id,
                language: "en_US",
                // source: "CN",
                source: "any",
                locale: "en_US",
                selectedSkuId: skuid,
                currency: "SAR",
            };
            let newShipping = false;
            let NewShippingResult;
            try {
                NewShippingResult = yield (0, index_1.getNewProductShippingServices)(queryDeliveryReq, tokenInfo);
                if ((NewShippingResult === null || NewShippingResult === void 0 ? void 0 : NewShippingResult.length) > 0) {
                    newShipping = true;
                }
            }
            catch (err) {
                console.error(err);
            }
            // console.log("result",result);
            if (newShipping) {
                console.log("newShipping is returned");
                return res.json({ shipping: NewShippingResult });
            }
            else {
                console.log("oldShipping is returned");
                console.log("oldShipping result", result);
                if (!result) {
                    result = [];
                }
                return res.json({ shipping: result });
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    });
}
exports.GetShippingProductIdCountryCode = GetShippingProductIdCountryCode;
