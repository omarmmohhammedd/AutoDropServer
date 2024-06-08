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
exports.getNewProductShippingServices = exports.getProductShippingServices = void 0;
const Request_1 = __importDefault(require("../Request"));
const appError_1 = __importDefault(require("../../../../utils/appError"));
const getProductShippingServices = (params, tokenInfo) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const method = "aliexpress.logistics.buyer.freight.get";
        const data = {
            method,
            aeopFreightCalculateForBuyerDTO: JSON.stringify(params),
            sign_method: "sha256",
        };
        (0, Request_1.default)(data, tokenInfo).then(({ data }) => {
            var _a, _b, _c;
            // console.log("data",data?.aliexpress_logistics_buyer_freight_get_response?.result?.aeop_freight_calculate_result_for_buyer_dtolist)
            const error = data.error_response;
            const result = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.aliexpress_logistics_buyer_freight_get_response) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.aeop_freight_calculate_result_for_buyer_dtolist) === null || _c === void 0 ? void 0 : _c.aeop_freight_calculate_result_for_buyer_d_t_o;
            if (error)
                return reject(new appError_1.default("UnprocessableEntity", 400));
            return resolve(result);
        });
    });
});
exports.getProductShippingServices = getProductShippingServices;
const getNewProductShippingServices = (params, tokenInfo) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const method = "aliexpress.ds.freight.query";
        const data = {
            method,
            queryDeliveryReq: JSON.stringify(params),
            sign_method: "sha256",
        };
        (0, Request_1.default)(data, tokenInfo).then(({ data }) => {
            var _a, _b, _c;
            const error = data.error_response;
            let result = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.aliexpress_ds_freight_query_response) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.delivery_options) === null || _c === void 0 ? void 0 : _c.delivery_option_d_t_o;
            console.log("NEW SHIPPING RESULT", result);
            console.log("NEW SHIPPING DATA", data);
            let modifiedRes = result === null || result === void 0 ? void 0 : result.map((shipping) => {
                let { free_shipping, shipping_fee_cent, company: shipping_method, max_delivery_days, min_delivery_days, delivery_date_desc, code } = shipping;
                let cent;
                let days;
                if (max_delivery_days == min_delivery_days) {
                    days = `${max_delivery_days} days`;
                }
                else {
                    days = `${min_delivery_days}-${max_delivery_days} days`;
                }
                if (delivery_date_desc) {
                    days = `${delivery_date_desc} ` + days;
                }
                if (free_shipping) {
                    cent = 0;
                }
                else {
                    cent = Number(shipping_fee_cent) * 100;
                }
                return {
                    // ...shipping,
                    freight: {
                        cent,
                    },
                    estimated_delivery_time: days,
                    shipping_method, serviceName: code
                };
            });
            if (error)
                return reject(new appError_1.default("UnprocessableEntity", 400));
            return resolve(modifiedRes);
        });
    });
});
exports.getNewProductShippingServices = getNewProductShippingServices;
