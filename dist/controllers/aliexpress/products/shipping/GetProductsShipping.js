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
exports.GetNewShipping = exports.GetProductShippingDetailsByID = exports.GetSKUId = void 0;
const tokenUserExtractor_1 = __importDefault(require("../../../../utils/handlers/tokenUserExtractor"));
const AliExpressTokenModel_1 = __importDefault(require("../../../../models/AliExpressTokenModel"));
const Request_1 = __importDefault(require("../../features/Request"));
const appError_1 = __importDefault(require("../../../../utils/appError"));
const shipping_1 = require("../../features/shipping");
function GetSKUId(_a) {
    return __awaiter(this, arguments, void 0, function* ({ product_id, tokenInfo, }) {
        return new Promise((resolve, reject) => {
            (0, Request_1.default)({
                ship_to_country: "SA",
                product_id: product_id,
                target_currency: "SAR",
                target_language: "AR",
                method: "aliexpress.ds.product.get",
                sign_method: "sha256",
            }, tokenInfo)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const aeResponse = response === null || response === void 0 ? void 0 : response.data;
                const result = (_a = aeResponse === null || aeResponse === void 0 ? void 0 : aeResponse.aliexpress_ds_product_get_response) === null || _a === void 0 ? void 0 : _a.result;
                const errorMessage = ((_b = aeResponse === null || aeResponse === void 0 ? void 0 : aeResponse.error_response) === null || _b === void 0 ? void 0 : _b.msg) ||
                    "There is something went wrong while getting product details or maybe this product is not available to shipping to SA, try another product or contact support.";
                // console.log(result);
                if (!result)
                    return resolve(false);
                else {
                    const { ae_item_sku_info_dtos, ae_item_base_info_dto, ae_multimedia_info_dto, } = result;
                    const skusId = ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_id;
                    console.log(skusId);
                    resolve(skusId);
                    /*  const { subject, product_id, detail }: any =
                        ae_item_base_info_dto || {};
            
                      const { ae_item_sku_info_d_t_o: SKUs }: any =
                        ae_item_sku_info_dtos || {};
            
                      const [{ price, quantities, options }, images] = await Promise.all([
                        GetProductOptions(SKUs || []),
                        GetProductImages(ae_multimedia_info_dto?.image_urls),
                      ]);
            
                      const values = new Array().concat(
                        ...options?.map((e: any) => e.values)
                      );
                      const hasValues = values.length;
            
                      const data: ProductSchema = {
                        name: subject,
                        description: detail,
                        price: price,
                        main_price: price,
                        quantity: quantities,
                        sku: uuid(),
                        images: images
                          ?.slice(0, 10)
                          ?.map((img: ImageType, index: number) => ({
                            ...img,
                            default: index === 0,
                          })),
                        options: options,
                        metadata_title: subject.substring(0, 70),
                        metadata_description: subject,
                        product_type: "product",
                        original_product_id: product_id,
                        merchant: "",
                        salla_product_id: "",
                        vendor_commission: 0,
                        vendor_price: 0,
                        require_shipping: true,
                        shipping: { name: "default", price: 0 },
                        sku_id: SKUs[0].sku_id,
                        vat: false,
                      };
                      const product = new Product(data).toJSON();
            
                      resolve(product); */
                }
            }))
                .catch((error) => {
                var _a;
                const err = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
                console.log(error);
                reject(new appError_1.default("InternalServerError", err));
            });
        });
    });
}
exports.GetSKUId = GetSKUId;
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
            const skuid = yield GetSKUId({ product_id, tokenInfo });
            let result = yield (0, shipping_1.getProductShippingServices)({
                sku_id: skuid,
                country_code: "SA",
                product_id,
                product_num: "1",
                price_currency: "SAR",
            }, tokenInfo);
            let queryDeliveryReq = {
                quantity: 1,
                shipToCountry: "SA",
                productId: product_id,
                language: "en_US",
                source: "CN",
                locale: "en_US",
                selectedSkuId: skuid,
                currency: "SAR",
            };
            try {
                let NewShippingResult = yield (0, shipping_1.getNewProductShippingServices)(queryDeliveryReq, tokenInfo);
            }
            catch (err) {
                console.error(err);
            }
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
function GetNewShipping(req, res, next) {
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
            let NewShippingResult;
            const skuid = yield GetSKUId({ product_id, tokenInfo });
            let queryDeliveryReq = {
                quantity: 1,
                shipToCountry: "SA",
                productId: product_id,
                language: "en_US",
                // source: "CN",
                source: "any",
                locale: "en_US",
                selectedSkuId: skuid,
                currency: "SAR",
            };
            try {
                NewShippingResult = yield (0, shipping_1.getNewProductShippingServices)(queryDeliveryReq, tokenInfo);
            }
            catch (err) {
                console.error(err);
                return res.json({ shipping: [] });
            }
            // console.log("result",result);
            if (!NewShippingResult) {
                NewShippingResult = [];
            }
            return res.json({ shipping: NewShippingResult });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    });
}
exports.GetNewShipping = GetNewShipping;
