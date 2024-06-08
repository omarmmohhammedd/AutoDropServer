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
exports.SendOrder = exports.PlaceOrder = void 0;
const Order_model_1 = require("../../models/Order.model");
const appError_1 = __importDefault(require("../../utils/appError"));
const Request_1 = __importDefault(require("../aliexpress/features/Request"));
const product_model_1 = require("../../models/product.model");
const AliExpressTokenModel_1 = __importDefault(require("../../models/AliExpressTokenModel"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const axios_1 = __importDefault(require("axios"));
const langdetect_1 = require("langdetect");
function isAllEnglish(text) {
    var _a, _b;
    if (!text)
        return true;
    const words = text.split(' ');
    for (let word of words) {
        const languages = (0, langdetect_1.detect)(word);
        console.log("languages", languages);
        if ((languages === null || languages === void 0 ? void 0 : languages.length) === 0 || (((_a = languages === null || languages === void 0 ? void 0 : languages[0]) === null || _a === void 0 ? void 0 : _a.lang) === 'ar' && ((_b = languages === null || languages === void 0 ? void 0 : languages[0]) === null || _b === void 0 ? void 0 : _b.prob) > 0.5)) {
            return false;
        }
    }
    return true;
}
let translateText = (text) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const options = {
            method: 'POST',
            url: process.env.translationURL,
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.translationKey,
                'X-RapidAPI-Host': process.env.translationHost
            },
            data: {
                text,
                sourceLang: 'ar',
                targetLang: 'en'
            }
        };
        const response = yield axios_1.default.request(options);
        console.log("response.status", response.status);
        if ((response === null || response === void 0 ? void 0 : response.status) != 200) {
            throw new appError_1.default("Please type the data in English and try again", 400);
        }
        if ((response === null || response === void 0 ? void 0 : response.status) !== 200)
            return text;
        console.log("response", response);
        return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.translatedText;
    }
    catch (err) {
        console.error(err);
        throw new appError_1.default("Error Happend While Translate Text", 400);
    }
});
function PlaceOrder(order, order_memo, CustomerData, shippingCurrIndex, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("CustomerData", CustomerData);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let logistics_address, product_items;
            const { items, shipping } = order.toJSON();
            const orderData = order.toJSON();
            let tokenData;
            try {
                let aliexpressDoc = yield AliExpressTokenModel_1.default.findOne({
                    userId: (_b = (_a = items === null || items === void 0 ? void 0 : items[0]) === null || _a === void 0 ? void 0 : _a.product) === null || _b === void 0 ? void 0 : _b.merchant,
                });
                tokenData = {
                    aliExpressAccessToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.accessToken,
                    aliExpressRefreshToken: aliexpressDoc === null || aliexpressDoc === void 0 ? void 0 : aliexpressDoc.refreshToken,
                };
            }
            catch (err) {
                console.error("failed to get aliexpress token data of user");
                console.error(err);
            }
            product_items = yield Promise.all(items === null || items === void 0 ? void 0 : items.map((item, itemIndex) => __awaiter(this, void 0, void 0, function* () {
                var _e, _f, _g, _h, _j, _k, _l, _m;
                const product = yield product_model_1.Product.findById((_e = item === null || item === void 0 ? void 0 : item.product) === null || _e === void 0 ? void 0 : _e._id).exec();
                if (!product)
                    return;
                /*  const { data: aliProduct } = await MakeRequest(
                   {
                     method: "aliexpress.ds.product.get",
                     product_id: product.original_product_id,
                     sign_method: "sha256",
                   },
                   tokenData
                 ); */
                // const productSkus = await getProductSkus(product.original_product_id)
                // console.log("productSkus",productSkus)
                // const sku_attr = productSkus.find((sku:any) => sku.sku_id === item.sku ||sku.id.split(';')[0].split('#')[0] === item.sku )
                // console.log("sku_attr",sku_attr)
                const sku_attr = item.choosenVariant;
                if (sku_attr) {
                    console.log("[shippingCurrIndex?.[itemIndex]", (_g = (_f = item === null || item === void 0 ? void 0 : item.product) === null || _f === void 0 ? void 0 : _f.shipping) === null || _g === void 0 ? void 0 : _g[(_h = shippingCurrIndex === null || shippingCurrIndex === void 0 ? void 0 : shippingCurrIndex[itemIndex]) !== null && _h !== void 0 ? _h : 0]);
                    return {
                        product_id: Number(product.original_product_id),
                        sku_attr: sku_attr.sku_code,
                        logistics_service_name: (_m = (_k = (_j = item === null || item === void 0 ? void 0 : item.product) === null || _j === void 0 ? void 0 : _j.shipping) === null || _k === void 0 ? void 0 : _k[(_l = shippingCurrIndex === null || shippingCurrIndex === void 0 ? void 0 : shippingCurrIndex[itemIndex]) !== null && _l !== void 0 ? _l : 0]) === null || _m === void 0 ? void 0 : _m.serviceName,
                        order_memo: order_memo !== null && order_memo !== void 0 ? order_memo : "Please Don't Put any logo on the products , We are using dropshipping service in our store",
                        product_count: item === null || item === void 0 ? void 0 : item.quantity,
                    };
                }
                else {
                    return reject(new appError_1.default("Error Happend While Send Order Contact Support", 400));
                }
            })).filter((e) => e));
            const addresss = shipping === null || shipping === void 0 ? void 0 : shipping.address;
            let { firstName, lastName, email, mobile, mobile_code, country, region, city, postalCode, district, address } = CustomerData !== null && CustomerData !== void 0 ? CustomerData : {};
            let full_name = `${firstName} ${lastName}`;
            // let isCityEnglish = isAllEnglish(city as string)  
            let isAddressEnglish = isAllEnglish(address);
            let isDistrictEnglish = isAllEnglish(district);
            // let isRegionEnglish = isAllEnglish(region as string)   
            let isFullNameEnglish = isAllEnglish(full_name);
            // city = translateCity(city as string)
            let province = region + " Province";
            try {
                /*   if(!isCityEnglish && translateCity(city as string)){
                    city = translateCity(city as string)
                     province = getProvince(city as string)+ " Province"
                  }else{
                
                    // if(!isCityEnglish) city = (await translateText(city as string))
                  } */
                if (!isAddressEnglish)
                    address = (yield translateText(address));
                if (!isDistrictEnglish)
                    district = (yield translateText(district));
                // if(!isRegionEnglish) region = (await translateText(region as string))
                if (!isFullNameEnglish)
                    full_name = (yield translateText(full_name));
            }
            catch (err) {
                return res.status(400).json({ message: "Please type the data in English and try again" });
            }
            // let toBeTranslated = [ city, address, district, region] 
            // console.log("toBeTranslated",toBeTranslated)
            // let indexesToBeTranslated = []
            /* if(!isCityEnglish) indexesToBeTranslated.push(0)
            if(!isAddressEnglish) indexesToBeTranslated.push(1)
            if(!isDistrictEnglish) indexesToBeTranslated.push(2)
            if(!isRegionEnglish) indexesToBeTranslated.push(3) */
            // console.log("indexesToBeTranslated",indexesToBeTranslated)
            // let text :any= indexesToBeTranslated.map((index)=>toBeTranslated[index])
            // console.log("text",text)
            //  text = text.join('/////')
            //  let translatedText =   (await translateText(text as string)).split("/////")
            /*  indexesToBeTranslated.forEach((index, i) => {
              const reverseIndex = translatedText.length - 1 - i;
              toBeTranslated[index] = translatedText[reverseIndex];
            }); */
            // console.log("translatedText",translatedText)
            // console.log("toBeTranslated",toBeTranslated)
            /* city = toBeTranslated[0]
            address = toBeTranslated[1]
            district = toBeTranslated[2]
            region = toBeTranslated[3] */
            // let cityEn = await translateModule.translate(addresss.city, {from: 'ar', to: 'en'}).then((res:any) => {return res.text}).catch((err:any) => {
            /*    translateModule.translate(addresss.city, {from: 'ar', to: 'en'}).then((res:any) => {
              cityEn= res.text
              console.log(res.text);
          }).catch((err:any) => {
              console.error(err);
          }); */
            /*     let cityEn =
                  (
                    await translateModule
                      .translate(addresss.city, { from: "ar", to: "en" })
                      .catch((err) => {})
                  )?.text ?? "Riyadh"; */
            // let cityEn = translateRes.text
            /*     let addressEn =
                  (
                    await translateModule
                      .translate(addresss.shipping_address, { from: "ar", to: "en" })
                      .catch(() => {})
                  )?.text ??
                  "Airport Road, King Khalid International Airport, Riyadh , Saudi Arabia"; */
            // console.log("addressEn", addressEn);
            /*
          translateModule.translate('الرياض', {from: 'ar', to: 'en'}).then((res:any) => {
            console.log(res.text);
        }).catch((err:any) => {
            console.error(err);
        }); */
            //old logisticsAddress
            let logistics_addressOld = {
                country: "SA",
                // city: cityEn,
                zip: addresss === null || addresss === void 0 ? void 0 : addresss.postal_code,
                // address:  `Airport Road, King Khalid International Airport, Riyadh , Saudi Arabia` ?? `${addresss?.street_en} ${addresss?.district_en}`,
                // address:  `${addresss?.shipping_address}`,
                // address: 'Qasr Al Khaleej'?? addressEn,
                address: `Qasr Al Khaleej King Khalid`,
                locale: "ar_SA",
                phone_country: "+966",
                full_name,
                is_foreigner: "false",
                mobile_no: "563754267" !== null && "563754267" !== void 0 ? "563754267" : `${(_c = orderData.customer) === null || _c === void 0 ? void 0 : _c.mobile}`,
                contact_person: full_name,
                // province:addresss?.province_en??"Eastern"
                // province: cityEn+ " Province",
            };
            //
            logistics_address = {
                country,
                city,
                zip: postalCode,
                // address:  `Airport Road, King Khalid International Airport, Riyadh , Saudi Arabia` ?? `${addresss?.street_en} ${addresss?.district_en}`,
                // address:  `${addresss?.shipping_address}`,
                // address: 'Qasr Al Khaleej'?? addressEn,
                address,
                locale: "ar_SA",
                phone_country: mobile_code,
                full_name,
                is_foreigner: "false",
                mobile_no: mobile !== null && mobile !== void 0 ? mobile : `${(_d = orderData.customer) === null || _d === void 0 ? void 0 : _d.mobile}`,
                contact_person: full_name,
                // province:addresss?.province_en??"Eastern"
                province,
            };
            console.log("logistics_address", logistics_address);
            const min = 100000000;
            const max = 999999999;
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            const data = JSON.stringify({
                logistics_address,
                out_order_id: randomNumber,
                // out_order_id:"123456789",
                product_items,
            });
            console.log("randomNumber", randomNumber);
            const method = "aliexpress.trade.buy.placeorder";
            const option = {
                method,
                param_place_order_request4_open_api_d_t_o: data,
                sign_method: "sha256",
            };
            try {
                (0, Request_1.default)(option, tokenData).then((_o) => __awaiter(this, [_o], void 0, function* ({ data }) {
                    var _p, _q, _r, _s;
                    const error = data.error_response;
                    console.log("DATAAA", data);
                    if (error)
                        return reject(new appError_1.default(error.msg, 400));
                    const result = (_q = (_p = data === null || data === void 0 ? void 0 : data.aliexpress_trade_buy_placeorder_response) === null || _p === void 0 ? void 0 : _p.result) === null || _q === void 0 ? void 0 : _q.order_list;
                    let orderNumbersArray = result === null || result === void 0 ? void 0 : result.number;
                    if (orderNumbersArray === null || orderNumbersArray === void 0 ? void 0 : orderNumbersArray[0]) {
                        let allOrderNumbers = orderNumbersArray === null || orderNumbersArray === void 0 ? void 0 : orderNumbersArray[0];
                        if ((orderNumbersArray === null || orderNumbersArray === void 0 ? void 0 : orderNumbersArray.length) > 0) {
                            allOrderNumbers = orderNumbersArray === null || orderNumbersArray === void 0 ? void 0 : orderNumbersArray.join(",");
                        }
                        yield Order_model_1.Order.findByIdAndUpdate(order.id, {
                            $set: {
                                // tracking_order_id: result.number[0],
                                tracking_order_id: allOrderNumbers,
                                paid: true,
                                status: "in_review",
                            },
                        }, { new: true }).then((e) => {
                            console.log(result);
                            console.log(result === null || result === void 0 ? void 0 : result.order_list);
                            return resolve(result);
                        });
                    }
                    else {
                        const err = (_s = (_r = data === null || data === void 0 ? void 0 : data.aliexpress_trade_buy_placeorder_response) === null || _r === void 0 ? void 0 : _r.result) === null || _s === void 0 ? void 0 : _s.error_code;
                        console.log(err);
                        return reject(new appError_1.default(err, 400));
                    }
                }));
            }
            catch (error) {
                console.log(error);
            }
        }));
    });
}
exports.PlaceOrder = PlaceOrder;
exports.SendOrder = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { order_id, order_memo, CustomerData, shippingCurrIndex } = req.body;
    const order = yield Order_model_1.Order.findOne({ order_id });
    if (!order) {
        return next(new appError_1.default("Order Not Found", 404));
    }
    if (order_memo) {
        order.order_memo = order_memo;
        order.DatabaseshippingCurrIndex = shippingCurrIndex;
        yield order.save();
    }
    const placeOrderResult = yield PlaceOrder(order, order_memo, CustomerData, shippingCurrIndex, res);
    return res.json({ data: placeOrderResult });
}));
