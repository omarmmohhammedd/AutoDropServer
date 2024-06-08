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
exports.GetProductDetailsTest = exports.GetProductId = exports.GetDetails = exports.GetRecommendedProductsPost = exports.GetProductByName = exports.GetRecommendedProducts = void 0;
const appError_1 = __importDefault(require("../../utils/appError"));
const Request_1 = __importDefault(require("./features/Request"));
const tokenUserExtractor_1 = __importDefault(require("../../utils/handlers/tokenUserExtractor"));
const AliExpressTokenModel_1 = __importDefault(require("../../models/AliExpressTokenModel"));
const shipping_1 = require("./features/shipping");
const path_1 = require("path");
const lodash_1 = require("lodash");
const slugify_1 = __importDefault(require("slugify"));
const product_model_1 = require("../../models/product.model");
const uuid_1 = require("uuid");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const fs_1 = __importDefault(require("fs"));
function generateRandomNumber(start, end) {
    // Generate a random decimal between 0 and 1
    var randomDecimal = Math.random();
    // Scale the random decimal to the desired range
    var randomInRange = randomDecimal * (end - start + 1);
    // Shift the range to start from the desired start number
    var randomInteger = Math.floor(randomInRange) + start;
    return randomInteger;
}
function GetRecommendedProducts(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // console.log(req.query);
        let user = yield (0, tokenUserExtractor_1.default)(req);
        if (!user)
            return res.status(401).json({ message: "token is invalid" });
        let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
        const { lang } = req.query;
        let result = [];
        let response = yield (0, Request_1.default)({
            method: "aliexpress.ds.feedname.get",
            sign_method: "sha256",
        }, {
            aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
            aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
        });
        let respData = response;
        // console.log(
        //   respData.data.aliexpress_ds_feedname_get_response?.resp_result.result.promos
        //     .promo[3]
        // );
        while (result.length < 10) {
            const randomPage = generateRandomNumber(0, ((_a = respData.data.aliexpress_ds_feedname_get_response) === null || _a === void 0 ? void 0 : _a.resp_result.result.promos.promo.length) - 1);
            const randomFeedName = respData.data.aliexpress_ds_feedname_get_response.resp_result.result
                .promos.promo[randomPage].promo_name;
            // console.log(randomFeedName);
            let response2 = yield (0, Request_1.default)({
                method: "aliexpress.ds.recommend.feed.get",
                target_currency: "SAR",
                country: "SA",
                // feed_name: randomFeedName,
                feed_name: "DS_Sports&Outdoors_bestsellers",
                target_language: lang,
                page_no: 1,
                page_size: 21,
                sign_method: "sha256",
            }, {
                aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
                aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
            });
            let resPage = response2;
            const products = resPage.data.aliexpress_ds_recommend_feed_get_response.result.products
                .traffic_product_d_t_o;
            if (products) {
                result.push(...products);
                // console.log(result.length);
            }
        }
        // console.log(result.length);
        if (!result.length)
            throw new appError_1.default("Products Not Found", 409);
        res.json({ result });
    });
}
exports.GetRecommendedProducts = GetRecommendedProducts;
function GetProductByName(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(req.query);
        let user = yield (0, tokenUserExtractor_1.default)(req);
        if (!user)
            return res.status(401).json({ message: "token is invalid" });
        let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
        const { lang } = req.query;
        let result = [];
        let response = yield (0, Request_1.default)({
            method: "aliexpress.ds.category.get",
            sign_method: "sha256",
            fields: "all",
            keywords: "shoes",
        }, {
            aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
            aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
        });
        let respData = response;
        console.log(respData);
        res.json({ response });
    });
}
exports.GetProductByName = GetProductByName;
exports.GetRecommendedProductsPost = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    console.log(req.query);
    let user = yield (0, tokenUserExtractor_1.default)(req);
    if (!user)
        return res.status(401).json({ message: "token is invalid" });
    if (!user.aliExpressToken)
        return res.status(403).json({ message: "please link your account with aliexpress" });
    let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
    const { lang } = req.query;
    let result = [];
    let response = yield (0, Request_1.default)({
        method: "aliexpress.ds.feedname.get",
        sign_method: "sha256",
    }, {
        aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
        aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
    });
    let respData = response;
    while (result.length < 20) {
        const randomPage = generateRandomNumber(0, ((_a = respData.data.aliexpress_ds_feedname_get_response) === null || _a === void 0 ? void 0 : _a.resp_result.result.promos.promo.length) - 1);
        const randomFeedName = (_b = respData.data.aliexpress_ds_feedname_get_response) === null || _b === void 0 ? void 0 : _b.resp_result.result.promos.promo[randomPage].promo_name;
        console.log(randomFeedName);
        let response2 = yield (0, Request_1.default)({
            method: "aliexpress.ds.recommend.feed.get",
            target_currency: "SAR",
            country: "SA",
            feed_name: randomFeedName,
            // feed_name: "DS_Sports&Outdoors_bestsellers",
            target_language: lang,
            // page_no: req.body.page,
            page_size: 10,
            sign_method: "sha256",
            //
            // category_id: "7",
            //
        }, {
            aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
            aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
        });
        let resPage = response2;
        const products = (_e = (_d = (_c = resPage === null || resPage === void 0 ? void 0 : resPage.data.aliexpress_ds_recommend_feed_get_response) === null || _c === void 0 ? void 0 : _c.result) === null || _d === void 0 ? void 0 : _d.products) === null || _e === void 0 ? void 0 : _e.traffic_product_d_t_o;
        if (products) {
            result.push(...products);
            console.log(result.length);
        }
    }
    console.log(result.length);
    if (!result.length)
        throw new appError_1.default("Products Not Found", 409);
    res.json({ result: result.slice(0, 20) });
}));
// two methods will be used
function GetProductOptions(SKUs) {
    return __awaiter(this, void 0, void 0, function* () {
        let quantities = 0, price = 0, options = [], concatValues = [], collectOptions = [], collectValues = [];
        collectValues = SKUs.map((sku) => {
            var _a, _b;
            return (_b = (_a = sku === null || sku === void 0 ? void 0 : sku.ae_sku_property_dtos) === null || _a === void 0 ? void 0 : _a.ae_sku_property_d_t_o) === null || _b === void 0 ? void 0 : _b.map((ev) => {
                const { sku_image, sku_price, sku_stock, sku_code, sku_available_stock, offer_sale_price, id, sku_id, } = sku;
                const quantity = sku_available_stock > 100 ? 100 : sku_available_stock;
                quantities += parseFloat(quantity || 0);
                return Object.assign(Object.assign({}, ev), { sku_id, sku_image: ev.sku_image ? ev.sku_image : sku_image, sku_price,
                    sku_stock,
                    sku_code,
                    quantity,
                    id,
                    offer_sale_price });
            });
        });
        concatValues = yield Promise.all(new Array().concat(...collectValues));
        collectOptions = (0, lodash_1.uniq)((0, lodash_1.map)(concatValues, "sku_property_name"));
        let sku_image_1;
        options = yield Promise.all(collectOptions
            .map((option, index) => {
            const uniqValues = (0, lodash_1.uniqBy)(concatValues === null || concatValues === void 0 ? void 0 : concatValues.filter((val) => (val === null || val === void 0 ? void 0 : val.sku_property_name) === option).map((e) => (Object.assign(Object.assign({}, e), { property_value_definition_name: (e === null || e === void 0 ? void 0 : e.property_value_definition_name) || (e === null || e === void 0 ? void 0 : e.sku_property_value) }))), "property_value_id"
            // sku_property_value
            // old property used for filtering
            );
            // console.log(uniqValues)
            const values = uniqValues === null || uniqValues === void 0 ? void 0 : uniqValues.map((val, idx) => {
                const isFirst = index == 0 && idx == 0;
                const { sku_image, property_value_definition_name, quantity, property_value_id, sku_property_id, id, sku_price, offer_sale_price, } = val;
                const valuePrice = parseFloat(sku_price);
                const offerPrice = parseFloat(offer_sale_price);
                const valPrice = valuePrice === offerPrice ? valuePrice : offerPrice;
                /*    const displayValue = slugify(property_value_definition_name, {
                  lower: true,
                }); */
                let displayValue;
                if (property_value_definition_name) {
                    displayValue = (0, slugify_1.default)(property_value_definition_name, {
                        lower: true,
                    });
                }
                sku_image_1 = sku_image;
                if (isFirst) {
                    price = valPrice;
                }
                return {
                    name: property_value_definition_name,
                    price: valPrice,
                    original_price: valPrice,
                    quantity: quantity,
                    is_default: isFirst,
                    property_id: property_value_id,
                    sku_id: val.sku_id,
                    display_value: displayValue,
                    sku: [sku_property_id, property_value_id].join(":"),
                    id,
                    sku_image,
                };
            });
            return {
                name: option,
                // display_type: sku_image_1 ? "image" : "text",
                display_type: "text",
                values,
            };
        })
            .filter((e) => {
            return e.name !== "Ships From" && e.name != "السفن من";
        }));
        return { price, quantities, options };
    });
}
function GetProductImages(URLs, variantsArr) {
    return __awaiter(this, void 0, void 0, function* () {
        // const splitImages = ae_multimedia_info_dto?.image_urls?.split(";");
        const splitImages = URLs === null || URLs === void 0 ? void 0 : URLs.split(";");
        let images = splitImages === null || splitImages === void 0 ? void 0 : splitImages.map((obj, index) => ({
            original: obj,
            thumbnail: obj,
            alt: "image " + index,
            default: false,
        }));
        // let tempImages = [...images]
        let tempImages = images.slice(0, 1);
        // let strippedImages = tempImages.map((im: any) => im.original);
        let skuImages = [];
        let alreadyAddedImages = [];
        variantsArr === null || variantsArr === void 0 ? void 0 : variantsArr.forEach((variant) => {
            let { relativeOptions: rP, sku_code } = variant;
            for (let i = 0; i < rP.length; i++) {
                let rPEl = rP[i];
                let { sku_image, sku_property_name: optionName, property_value_definition_name: valueDefName } = rPEl;
                if (sku_image) {
                    // let { sku_code } = rPEl;
                    let imageValues = {
                        original: sku_image,
                        code: sku_code,
                        default: false, valueDefName, optionName
                    };
                    /*   if (strippedImages.includes(sku_image)) {
                        tempImages = tempImages.filter((im: any) => {
                          return im.original !== sku_image;
                        });
                      } */
                    if (!alreadyAddedImages.includes(sku_image)) {
                        skuImages.push(imageValues);
                        alreadyAddedImages.push(sku_image);
                    }
                }
            }
        });
        let productImages = [];
        if ((skuImages === null || skuImages === void 0 ? void 0 : skuImages.length) + (tempImages === null || tempImages === void 0 ? void 0 : tempImages.length) <= 10) {
            productImages = [...tempImages, ...skuImages];
        }
        else {
            productImages = [...images];
        }
        fs_1.default.appendFile("images.json", JSON.stringify({ finalImages: productImages, skuImages, images, tempImages }, null, 2), function (err) { });
        return productImages;
    });
}
function GetDetails(_a) {
    return __awaiter(this, arguments, void 0, function* ({ product_id, tokenInfo, first_level_category_name, second_level_category_name, target_sale_price, target_original_price, lang, }) {
        return new Promise((resolve, reject) => {
            (0, Request_1.default)({
                ship_to_country: "SA",
                product_id: product_id,
                target_currency: "SAR",
                target_language: lang,
                method: "aliexpress.ds.product.get",
                sign_method: "sha256",
            }, tokenInfo)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const aeResponse = response === null || response === void 0 ? void 0 : response.data;
                const result = (_a = aeResponse === null || aeResponse === void 0 ? void 0 : aeResponse.aliexpress_ds_product_get_response) === null || _a === void 0 ? void 0 : _a.result;
                const errorMessage = ((_b = aeResponse === null || aeResponse === void 0 ? void 0 : aeResponse.error_response) === null || _b === void 0 ? void 0 : _b.msg) ||
                    "There is something went wrong while getting product details or maybe this product is not available to shipping to SA, try another product or contact support.";
                // console.log(result);
                if (!result)
                    return resolve(false);
                else {
                    const { ae_item_sku_info_dtos, ae_item_base_info_dto, ae_multimedia_info_dto, } = result;
                    const { subject, product_id, detail } = ae_item_base_info_dto || {};
                    const { ae_item_sku_info_d_t_o: SKUs } = ae_item_sku_info_dtos || {};
                    let variantsArr = SKUs.map((variant) => {
                        var _a;
                        let obj = {};
                        let { offer_sale_price, sku_available_stock, id, sku_code, sku_id, sku_price, offer_bulk_sale_price, sku_stock, } = variant;
                        obj.offer_sale_price = offer_sale_price;
                        obj.sku_available_stock = sku_available_stock;
                        obj.id = id;
                        obj.sku_code = sku_code;
                        obj.sku_id = sku_id;
                        obj.sku_price = sku_price;
                        obj.offer_bulk_sale_price = offer_bulk_sale_price;
                        obj.sku_stock = sku_stock;
                        let { ae_sku_property_dtos } = variant;
                        let relativeOptions = (_a = ae_sku_property_dtos === null || ae_sku_property_dtos === void 0 ? void 0 : ae_sku_property_dtos.ae_sku_property_d_t_o) === null || _a === void 0 ? void 0 : _a.map((e) => {
                            return e;
                        });
                        obj.relativeOptions = relativeOptions;
                        return obj;
                    });
                    let totalQuantityVariants = 0;
                    variantsArr.forEach((variant) => {
                        let { sku_available_stock: quantity } = variant;
                        if (quantity) {
                            totalQuantityVariants += quantity;
                        }
                    });
                    if ((_d = (_c = variantsArr === null || variantsArr === void 0 ? void 0 : variantsArr[0]) === null || _c === void 0 ? void 0 : _c.relativeOptions) === null || _d === void 0 ? void 0 : _d.some((option) => option.sku_property_name === "Ships From" ||
                        option.sku_property_name == "السفن من")) {
                        // remove 'ships from' variants
                        let variantsIdsToKeep = [];
                        let variantsIdentifiers = [];
                        variantsArr.forEach((variant, index) => {
                            let { relativeOptions } = variant;
                            relativeOptions = relativeOptions.filter((element, index) => element.sku_property_name !== "Ships From" &&
                                element.sku_property_name !== "السفن من");
                            let variantIdentifier = relativeOptions
                                .map((element, index) => `${element.sku_property_id}:${element.property_value_id}`)
                                .join("-");
                            if (!variantsIdentifiers.includes(variantIdentifier)) {
                                variantsIdentifiers.push(variantIdentifier);
                                variantsIdsToKeep.push(index);
                            }
                        });
                        // console.log("variantsIdsToKeep", variantsIdsToKeep);
                        // console.log("variantsIdsToKeep.length", variantsIdsToKeep.length);
                        const newVariantsWithoutShipsFrom = variantsArr
                            .filter((variant, index) => {
                            return variantsIdsToKeep.includes(index);
                        })
                            .map((variant) => {
                            let { relativeOptions } = variant;
                            relativeOptions = relativeOptions.filter((rO) => {
                                return (rO.sku_property_name !== "Ships From" &&
                                    rO.sku_property_name !== "السفن من");
                            });
                            return Object.assign(Object.assign({}, variant), { relativeOptions });
                        });
                        // console.log(
                        //   "newVariantsWithoutShipsFrom",
                        //   newVariantsWithoutShipsFrom
                        // );
                        variantsArr = newVariantsWithoutShipsFrom;
                    }
                    const [{ price, options }, images] = yield Promise.all([
                        GetProductOptions(SKUs || []),
                        GetProductImages(ae_multimedia_info_dto === null || ae_multimedia_info_dto === void 0 ? void 0 : ae_multimedia_info_dto.image_urls, variantsArr),
                    ]);
                    let targetSalePrice = Number(variantsArr[0].offer_sale_price) || target_sale_price;
                    let targetOriginalPrice = Number(variantsArr[0].sku_price) || target_original_price;
                    const data = {
                        name: subject,
                        description: detail,
                        price: price,
                        main_price: price,
                        quantity: totalQuantityVariants,
                        sku: (0, uuid_1.v4)(),
                        images: (_e = images === null || images === void 0 ? void 0 : images.slice(0, 10)) === null || _e === void 0 ? void 0 : _e.map((img, index) => (Object.assign(Object.assign({}, img), { default: index === 0 }))),
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
                        // category_id: ae_item_base_info_dto.category_id,
                        first_level_category_name,
                        second_level_category_name,
                        target_sale_price: targetSalePrice,
                        target_original_price: targetOriginalPrice,
                        variantsArr,
                    };
                    const product = new product_model_1.Product(data).toJSON();
                    resolve(product);
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
exports.GetDetails = GetDetails;
function GetProductId(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pathname } = new URL(url);
        const filename = (0, path_1.basename)(pathname);
        const product_id = filename.replace((0, path_1.extname)(filename), "");
        return product_id;
    });
}
exports.GetProductId = GetProductId;
/* export async function GetProductDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      url,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
    } = req.body;
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    let tokenInfo = {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    };
    const product_id = await GetProductId(url);


    const product = await GetDetails({
      product_id,
      tokenInfo,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
    });
    const result = await getProductShippingServices(
      {
        sku_id: product.sku_id,
        country_code: "SA",
        product_id,
        product_num: "1",
        price_currency: "SAR",
      },
      tokenInfo
    );

    return res.json({ product, shipping: result });
  } catch (error) {
    console.log(error);
    next(error);
  }
} */
function GetProductDetailsTest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { url, first_level_category_name, second_level_category_name, target_sale_price, target_original_price, lang, } = req.body;
            let user = yield (0, tokenUserExtractor_1.default)(req);
            if (!user)
                return res.status(401).json({ message: "token is invalid" });
            let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
            let tokenInfo = {
                aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
                aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
            };
            const product_id = yield GetProductId(url);
            /*     if (userType === "vendor")
              await CheckSubscription(user_id, "products_limit"); */
            const productInfo = yield GetDetails({
                product_id,
                tokenInfo,
                first_level_category_name,
                second_level_category_name,
                target_sale_price,
                target_original_price,
                lang,
            });
            let result;
            try {
                result = yield (0, shipping_1.getProductShippingServices)({
                    sku_id: productInfo.sku_id,
                    country_code: "SA",
                    product_id,
                    product_num: "1",
                    price_currency: "SAR",
                }, tokenInfo);
            }
            catch (err) {
                console.error(err);
            }
            //NEW SHIpping
            let queryDeliveryReq = {
                quantity: 1,
                shipToCountry: "SA",
                productId: +product_id,
                language: "en_US",
                // source: "CN",
                source: "any",
                locale: "en_US",
                selectedSkuId: productInfo.sku_id,
                currency: "SAR",
            };
            let newShipping = false;
            let NewShippingResult;
            try {
                NewShippingResult = yield (0, shipping_1.getNewProductShippingServices)(queryDeliveryReq, tokenInfo);
                if ((NewShippingResult === null || NewShippingResult === void 0 ? void 0 : NewShippingResult.length) > 0) {
                    newShipping = true;
                }
            }
            catch (err) {
                console.error(err);
            }
            if (newShipping) {
                // console.log("newShipping is returned");
                result = NewShippingResult;
            }
            //NEW SHIPPING
            //
            let _d = (0, lodash_1.pick)(productInfo, [
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
            ]), { merchant, main_price, metadata_title, metadata_description, name, price } = _d, body = __rest(_d, ["merchant", "main_price", "metadata_title", "metadata_description", "name", "price"]);
            if (price < main_price) {
                [price, main_price] = [main_price, price];
            }
            const { role, _id } = req.user;
            // console.log("productInfo?.name", productInfo?.name);
            // console.log("productInfo?.metadata_title", productInfo?.metadata_title);
            // console.log(
            //   "productInfo?.metadata_description",
            //   productInfo?.metadata_description
            // );
            // console.log(
            //   "productInfo?.description.slice(0,12",
            //   productInfo?.description.slice(0, 12)
            // );
            const product = new product_model_1.Product(Object.assign(Object.assign({ name: name }, body), { price, vendor_commission: 0, main_price, merchant: role === "client" ? _id : merchant, sku_id: productInfo.sku_id, vat: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.vat) && true, first_level_category_name,
                second_level_category_name,
                target_sale_price,
                target_original_price, variantsArr: productInfo.variantsArr }));
            // console.log("product?.name", product?.name);
            let metadataDescSliced = productInfo.metadata_description;
            if (((_b = productInfo === null || productInfo === void 0 ? void 0 : productInfo.metadata_description) === null || _b === void 0 ? void 0 : _b.length) > 70) {
                metadataDescSliced = productInfo.metadata_description.slice(0, 70);
            }
            // console.log(
            //   "productInfo.description",
            //   productInfo.description.slice(0, 20)
            // );
            if (!productInfo.description) {
                // console.log("NO DESCRIPTION");
            }
            product.metadata_title = productInfo.metadata_title;
            product.metadata_description = metadataDescSliced;
            product.description = productInfo.description;
            const options = (_c = body === null || body === void 0 ? void 0 : body.options) === null || _c === void 0 ? void 0 : _c.map((option) => {
                const values = option.values;
                return Object.assign(Object.assign({}, option), { values: values === null || values === void 0 ? void 0 : values.map((value) => {
                        const valuePrice = value.original_price;
                        /* const vendorOptionPrice = parseFloat(
                          (valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2)
                        ); */
                        return Object.assign(Object.assign({}, value), { original_price: valuePrice, price: valuePrice });
                    }) });
            });
            product.options = options;
            let { category_id, category_name } = req.body;
            // product.category_name = category_name;
            // product.category_id = category_id;
            //@ts-ignore
            product.shipping = result;
            //@ts-ignore
            if ((result === null || result === void 0 ? void 0 : result.length) == 0) {
                product.shippingAvailable = false;
            }
            else if ((result === null || result === void 0 ? void 0 : result.length) > 0) {
                product.shippingAvailable = true;
            }
            // console.log("shippingAvailable", result?.length == 0);
            // console.log("result", result);
            const jsonProduct = product.toJSON();
            yield product.save();
            return res.status(201).json({ success: true });
            /*
            attachShippingInfoToProuct(
              product._id.toString(),
              product.original_product_id,
              req
            ); */
            //
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    });
}
exports.GetProductDetailsTest = GetProductDetailsTest;
