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
exports.GetRecommendedProductsByImage = exports.GetRecommendedProductsByCategory = exports.GetRecommendedProductsByURL = exports.GetProductId = void 0;
const catchAsync_1 = __importDefault(require("../../../../utils/catchAsync"));
const appError_1 = __importDefault(require("../../../../utils/appError"));
const tokenUserExtractor_1 = __importDefault(require("../../../../utils/handlers/tokenUserExtractor"));
const AliExpressTokenModel_1 = __importDefault(require("../../../../models/AliExpressTokenModel"));
const Request_1 = __importStar(require("../../features/Request"));
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
// let translate: any;
function GetProductId(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pathname } = new URL(url);
        const filename = (0, path_1.basename)(pathname);
        const product_id = filename.replace((0, path_1.extname)(filename), "");
        return product_id;
    });
}
exports.GetProductId = GetProductId;
function generateRandomNumber(start, end) {
    var randomDecimal = Math.random();
    var randomInRange = randomDecimal * (end - start + 1);
    var randomInteger = Math.floor(randomInRange) + start;
    return randomInteger;
}
exports.GetRecommendedProductsByURL = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    let { url } = req.body;
    function getOriginalUrl(shortUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(shortUrl, {
                maxRedirects: 0, // Prevent axios from following redirects
                validateStatus: function (status) {
                    return status >= 200 && status < 400; // Accept all status codes below 400
                },
            });
            return response.headers.location; // This is the original URL
        });
    }
    const shortUrl = 'https://a.aliexpress.com/_okjpgk0';
    const originalUrl = yield getOriginalUrl(shortUrl);
    console.log("originalUrl", originalUrl);
    // get first_level_category_id if not get second level
    // iterate through the feedname and get the products
    let product_id = yield GetProductId(url);
    if (isNaN(Number(product_id))) {
        let originalProductURL = yield getOriginalUrl(url);
        product_id = yield GetProductId(originalProductURL);
    }
    console.log("url", url);
    console.log("product_id", product_id);
    console.log("typeof product_id", typeof product_id);
    console.log(req.query);
    let user = yield (0, tokenUserExtractor_1.default)(req);
    if (!user)
        return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
    const { lang } = req.query;
    let result = [];
    let tokenInfo = {
        aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
        aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
    };
    let promisesArr = [];
    let productInfoResp = (0, Request_1.default)({
        ship_to_country: "SA",
        product_id: product_id,
        target_currency: "SAR",
        target_language: lang,
        method: "aliexpress.ds.product.get",
        sign_method: "sha256",
    }, tokenInfo);
    let response = (0, Request_1.default)({
        method: "aliexpress.ds.feedname.get",
        sign_method: "sha256",
    }, {
        aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
        aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
    });
    promisesArr.push(productInfoResp);
    promisesArr.push(response);
    try {
        let promisesRes = yield Promise.all(promisesArr);
        let searchedProduct = (_e = (_d = (_c = (_b = (_a = promisesRes[0]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.aliexpress_ds_product_get_response) === null || _c === void 0 ? void 0 : _c.result) === null || _d === void 0 ? void 0 : _d.ae_item_sku_info_dtos) === null || _e === void 0 ? void 0 : _e[0];
        let searchedProductResult = (_h = (_g = (_f = promisesRes[0]) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.aliexpress_ds_product_get_response) === null || _h === void 0 ? void 0 : _h.result;
        let searchedProductFirstVariant = (_k = (_j = searchedProductResult === null || searchedProductResult === void 0 ? void 0 : searchedProductResult.ae_item_sku_info_dtos) === null || _j === void 0 ? void 0 : _j.ae_item_sku_info_d_t_o) === null || _k === void 0 ? void 0 : _k[0];
        console.log("searchedProductResult?.ae_item_base_info_dto", (_l = searchedProductResult === null || searchedProductResult === void 0 ? void 0 : searchedProductResult.ae_item_base_info_dto) === null || _l === void 0 ? void 0 : _l.avg_evaluation_rating);
        console.log("searchedProductResult", searchedProductResult);
        let selectedProductImages = (_r = (_q = (_p = (_o = (_m = promisesRes[0]) === null || _m === void 0 ? void 0 : _m.data) === null || _o === void 0 ? void 0 : _o.aliexpress_ds_product_get_response) === null || _p === void 0 ? void 0 : _p.result) === null || _q === void 0 ? void 0 : _q.ae_multimedia_info_dto) === null || _r === void 0 ? void 0 : _r.image_urls.split(';');
        let product_title = (_s = searchedProductResult === null || searchedProductResult === void 0 ? void 0 : searchedProductResult.ae_item_base_info_dto) === null || _s === void 0 ? void 0 : _s.subject;
        let searchedProductObject = {
            target_original_price: searchedProductFirstVariant === null || searchedProductFirstVariant === void 0 ? void 0 : searchedProductFirstVariant.sku_price,
            product_main_image_url: selectedProductImages === null || selectedProductImages === void 0 ? void 0 : selectedProductImages[0],
            target_sale_price: searchedProductFirstVariant === null || searchedProductFirstVariant === void 0 ? void 0 : searchedProductFirstVariant.offer_sale_price,
            product_title,
            product_id: (_t = searchedProductResult === null || searchedProductResult === void 0 ? void 0 : searchedProductResult.ae_item_base_info_dto) === null || _t === void 0 ? void 0 : _t.product_id,
            evaluate_rate: (((_u = searchedProductResult === null || searchedProductResult === void 0 ? void 0 : searchedProductResult.ae_item_base_info_dto) === null || _u === void 0 ? void 0 : _u.avg_evaluation_rating) * 100) / 5 + "%",
            product_detail_url: url
            // product_title : searchedProductResult?.ae_item_base_info_dto?.subject
        };
        /* if(lang=="ar"){
          import('translate').then((module) => {
            translate = module;
            // You can use translate here...
            translate(product_title, { to: 'ar' }).then((text:string) => {
              console.log(text);
              searchedProductObject.product_title = text
            });
          });
        } */
        result.push(searchedProductObject);
        /*
        
          {
                  "original_price": "0.01",
                  "product_small_image_urls": [],
                  "second_level_category_name": "Home Textile",
                  "product_detail_url": "https://www.aliexpress.com/item/32832712618.html",
                  "target_sale_price": "0.01",
                  "second_level_category_id": "405",
                  "discount": "10%",
                  "product_main_image_url": "https://ae04.alicdn.com/kf/HTB1zQFrj93PL1JjSZFtxh7lRVXa0.jpeg",
                  "first_level_category_id": "15",
                  "target_sale_price_currency": "USD",
                  "original_price_currency": "USD",
                  "platform_product_type": "ALL",
                  "shop_url": "https://www.aliexpress.com/store/402172",
                  "target_original_price_currency": "USD",
                  "product_id": "32832712618",
                  "seller_id": "200042360",
                  "target_original_price": "0.01",
                  "product_video_url": "https://xxx.html",
                  "first_level_category_name": "Home \u0026 Garden",
                  "ship_to_days": "10",
                  "evaluate_rate": "0.0%",
                  "sale_price": "0.01",
                  "product_title": "test-test-womenJeans-999",
                  "shop_id": "402172",
                  "sale_price_currency": "USD",
                  "lastest_volume": "28"
                }*/
        let respData = promisesRes[1];
        while (result.length < 19) {
            const randomPage = generateRandomNumber(0, ((_v = respData.data.aliexpress_ds_feedname_get_response) === null || _v === void 0 ? void 0 : _v.resp_result.result.promos.promo.length) - 1);
            const randomFeedName = (_w = respData.data.aliexpress_ds_feedname_get_response) === null || _w === void 0 ? void 0 : _w.resp_result.result.promos.promo[randomPage].promo_name;
            console.log(randomFeedName);
            let response2 = yield (0, Request_1.default)({
                method: "aliexpress.ds.recommend.feed.get",
                target_currency: "SAR",
                country: "SA",
                feed_name: randomFeedName,
                target_language: lang,
                sign_method: "sha256",
            }, {
                aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
                aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
            });
            let resPage = response2;
            const products = (_z = (_y = (_x = resPage === null || resPage === void 0 ? void 0 : resPage.data.aliexpress_ds_recommend_feed_get_response) === null || _x === void 0 ? void 0 : _x.result) === null || _y === void 0 ? void 0 : _y.products) === null || _z === void 0 ? void 0 : _z.traffic_product_d_t_o;
            console.log((_0 = resPage === null || resPage === void 0 ? void 0 : resPage.data.aliexpress_ds_recommend_feed_get_response) === null || _0 === void 0 ? void 0 : _0.result);
            if (products) {
                result.push(...products);
                console.log(result.length);
            }
        }
        console.log(result.length);
        if (!result.length)
            throw new appError_1.default("Products Not Found", 409);
        res.json({ result: result.slice(0, 20) });
    }
    catch (err) {
        console.log(err);
        throw new appError_1.default("Products Not Found", 409);
    }
}));
exports.GetRecommendedProductsByCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _1, _2, _3, _4, _5;
    let { categoryName } = req.body;
    const categories = {
        stationary: [21, 34, 1420],
        electronics: [6, 44, 502],
        sportsSupplies: [18, 34, 1501],
        accessories: [44, 1501],
        smartDevices: [44, 509],
        perfumes: [66],
        cosmeticProducts: [66],
        clothes: [3, 66, 1501],
        decor: [15, 39, 1503],
    };
    const currentCategory = categories[categoryName];
    console.log("currentCategory", currentCategory);
    console.log(req.query);
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
    let i = 0;
    let promosLength = ((_1 = respData.data.aliexpress_ds_feedname_get_response) === null || _1 === void 0 ? void 0 : _1.resp_result.result.promos.promo.length) - 1;
    while (result.length < 20 && i < promosLength) {
        let currFeedName = (_2 = respData.data.aliexpress_ds_feedname_get_response) === null || _2 === void 0 ? void 0 : _2.resp_result.result.promos.promo[i].promo_name;
        const randomCategoryIdIndex = generateRandomNumber(0, currentCategory.length - 1);
        const randomCategoryId = currentCategory[randomCategoryIdIndex];
        let response2 = yield (0, Request_1.default)({
            method: "aliexpress.ds.recommend.feed.get",
            target_currency: "SAR",
            country: "SA",
            feed_name: currFeedName,
            target_language: lang,
            page_size: 10,
            sign_method: "sha256",
            category_id: randomCategoryId,
        }, {
            aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
            aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
        });
        let resPage = response2;
        const products = (_5 = (_4 = (_3 = resPage === null || resPage === void 0 ? void 0 : resPage.data.aliexpress_ds_recommend_feed_get_response) === null || _3 === void 0 ? void 0 : _3.result) === null || _4 === void 0 ? void 0 : _4.products) === null || _5 === void 0 ? void 0 : _5.traffic_product_d_t_o;
        if (products) {
            result.push(...products);
            console.log(result.length);
        }
        i += 1;
    }
    console.log(result.length);
    if (!result.length)
        throw new appError_1.default("Products Not Found", 409);
    res.json({ result: result.slice(0, 20) });
}));
exports.GetRecommendedProductsByImage = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
    let user = yield (0, tokenUserExtractor_1.default)(req);
    if (!user)
        return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({ userId: user === null || user === void 0 ? void 0 : user._id });
    const { lang } = req.query;
    let formData = req.body;
    console.log("formData", formData);
    let result = [];
    let response2 = yield (0, Request_1.MakeRequestImage)({
        shpt_to: "SA",
        target_currency: "SAR",
        product_cnt: 20,
        target_language: lang,
        // sort: "SALE_PRICE_ASC",
        method: "aliexpress.ds.image.search",
        sign_method: "sha256",
    }, {
        aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
        aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
    }, req.file);
    let resPage = response2;
    console.log("resPage", resPage);
    console.log("resPage?.aliexpress_ds_image_search_response", (_6 = resPage === null || resPage === void 0 ? void 0 : resPage.data) === null || _6 === void 0 ? void 0 : _6.aliexpress_ds_image_search_response);
    console.log("resPage?.aliexpress_ds_image_search_response?.data", (_8 = (_7 = resPage === null || resPage === void 0 ? void 0 : resPage.data) === null || _7 === void 0 ? void 0 : _7.aliexpress_ds_image_search_response) === null || _8 === void 0 ? void 0 : _8.data);
    console.log("resPage?.aliexpress_ds_image_search_response?.data?.products?.traffic_image_product_d_t_o", (_12 = (_11 = (_10 = (_9 = resPage === null || resPage === void 0 ? void 0 : resPage.data) === null || _9 === void 0 ? void 0 : _9.aliexpress_ds_image_search_response) === null || _10 === void 0 ? void 0 : _10.data) === null || _11 === void 0 ? void 0 : _11.products) === null || _12 === void 0 ? void 0 : _12.traffic_image_product_d_t_o);
    const products = (_16 = (_15 = (_14 = (_13 = resPage === null || resPage === void 0 ? void 0 : resPage.data) === null || _13 === void 0 ? void 0 : _13.aliexpress_ds_image_search_response) === null || _14 === void 0 ? void 0 : _14.data) === null || _15 === void 0 ? void 0 : _15.products) === null || _16 === void 0 ? void 0 : _16.traffic_image_product_d_t_o;
    if (!products || !products.length)
        throw new appError_1.default("Products Not Found", 409);
    if (products) {
        result.push(...products);
        console.log(result.length);
    }
    // }
    console.log(result.length);
    if (!result.length)
        throw new appError_1.default("Products Not Found", 409);
    res.json({ result: result.slice(0, 20) });
}));
