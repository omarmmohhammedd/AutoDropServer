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
exports.updateOrderStatusUpdated = void 0;
const node_cron_1 = require("node-cron");
const Request_1 = __importDefault(require("../../controllers/aliexpress/features/Request"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const Order_model_1 = require("../../models/Order.model");
const product_model_1 = require("../../models/product.model");
// const time: string = "0 */12 * * *";
const UpdateSallaOrderStatus_1 = require("./handlers/UpdateSallaOrderStatus");
const fs_1 = __importDefault(require("fs"));
const time2 = "0 * * * *";
// const time: string = "0 */1 * * *";
//                   "min hour dayOmonth monthOyear dayOweek"
const time = "23 */1 * * *";
exports.updateOrderStatusUpdated = (0, node_cron_1.schedule)(time, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Cron Start To Tracking And Update Order Status ");
    try {
        let orders;
        let result;
        let paginateOptions = {
            limit: 5,
            page: 1,
        };
        do {
            const result = yield Order_model_1.Order.paginate({ tracking_order_id: { $ne: null } }, paginateOptions);
            orders = result.docs;
            if (orders.length) {
                orders.forEach((order) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    const orderData = order.toJSON();
                    console.log("orderData", orderData);
                    if (orderData.tracking_order_id) {
                        const body = {
                            method: "aliexpress.trade.ds.order.get",
                            single_order_query: JSON.stringify({
                                order_id: orderData.tracking_order_id,
                                // order_id: 690605028,
                            }),
                            sign_method: "sha256",
                        };
                        const user = yield user_model_1.default.findById(order.merchant).populate([
                            { path: "aliExpressToken", select: "accessToken refreshToken" },
                            { path: "sallaToken", select: "accessToken refreshToken" },
                        ]);
                        let { aliExpressToken, sallaToken } = user;
                        // let sallaToken: any = order.merchant.sallaToken;
                        let tokenInfo = {
                            aliExpressAccessToken: aliExpressToken === null || aliExpressToken === void 0 ? void 0 : aliExpressToken.accessToken,
                            aliExpressRefreshToken: aliExpressToken === null || aliExpressToken === void 0 ? void 0 : aliExpressToken.refreshToken,
                        };
                        console.log("tokenInfo", tokenInfo);
                        console.log("body", body);
                        if (!tokenInfo.aliExpressAccessToken || !(sallaToken === null || sallaToken === void 0 ? void 0 : sallaToken.accessToken)) {
                            return;
                        }
                        const { data: trackingResponse } = yield (0, Request_1.default)(body, tokenInfo);
                        const orderStatus = (_b = (_a = trackingResponse === null || trackingResponse === void 0 ? void 0 : trackingResponse.aliexpress_trade_ds_order_get_response) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.order_status;
                        console.log("orderStatus", orderStatus);
                        const tokens = user === null || user === void 0 ? void 0 : user.tokens;
                        fs_1.default.appendFile("orderStatusCRON.json", JSON.stringify({ orderStatus }, null, 2), (err) => { console.error(err); });
                        // const access_token = CheckTokenExpire(tokens);
                        const access_token = sallaToken.accessToken;
                        if (orderStatus === "PLACE_ORDER_SUCCESS") {
                            yield Order_model_1.Order.findByIdAndUpdate(orderData.id, {
                                status: "in_review",
                            });
                        }
                        else if (orderStatus === "IN_CANCEL") {
                            yield (0, UpdateSallaOrderStatus_1.UpdateSalaOrderStatus)("canceled", order.order_id, access_token).then(() => __awaiter(void 0, void 0, void 0, function* () {
                                return yield Order_model_1.Order.findByIdAndUpdate(orderData.id, {
                                    status: "canceled",
                                });
                            }));
                        }
                        else if (orderStatus === "WAIT_SELLER_SEND_GOODS") {
                            yield (0, UpdateSallaOrderStatus_1.UpdateSalaOrderStatus)("in_progress", order.order_id, access_token).then(() => __awaiter(void 0, void 0, void 0, function* () {
                                return yield Order_model_1.Order.findByIdAndUpdate(orderData.id, {
                                    status: "in_progress",
                                });
                            }));
                        }
                        else if (orderStatus === "WAIT_BUYER_ACCEPT_GOODS") {
                            yield (0, UpdateSallaOrderStatus_1.UpdateSalaOrderStatus)("delivering", order.order_id, access_token).then(() => __awaiter(void 0, void 0, void 0, function* () {
                                return yield Order_model_1.Order.findByIdAndUpdate(orderData.id, {
                                    status: "delivering",
                                });
                            }));
                        }
                        else if (orderStatus === "FINISH") {
                            yield (0, UpdateSallaOrderStatus_1.UpdateSalaOrderStatus)("delivered", order.order_id, access_token).then(() => __awaiter(void 0, void 0, void 0, function* () {
                                return yield Order_model_1.Order.findByIdAndUpdate(orderData.id, {
                                    status: "completed",
                                });
                            }));
                        }
                        else
                            return;
                    }
                    if (orderData.status === "created") {
                        let x = 0;
                        if (x) {
                            let total = 0, sub_total = 0, commission = 0, meta = {};
                            const items = yield Promise.all(orderData.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                                var _c, _d, _e;
                                try {
                                    const productId = (_c = item === null || item === void 0 ? void 0 : item.product) === null || _c === void 0 ? void 0 : _c._id;
                                    const product = yield product_model_1.Product.findById(productId).select("name salla_product_id price main_price vendor_commission vendor_price merchant sku options");
                                    if (product) {
                                        const jsonProduct = product.toJSON();
                                        const options = yield Promise.all((_d = item.options) === null || _d === void 0 ? void 0 : _d.map((option, idx) => {
                                            var _a, _b;
                                            const productOption = (_b = (_a = jsonProduct === null || jsonProduct === void 0 ? void 0 : jsonProduct.options) === null || _a === void 0 ? void 0 : _a[idx]) === null || _b === void 0 ? void 0 : _b.values;
                                            const variant = productOption.find((pd) => pd.salla_value_id == option.value.id);
                                            const value = {
                                                price: {
                                                    amount: variant.original_price || product.main_price,
                                                },
                                            };
                                            const result = Object.assign(Object.assign({}, option), { value: Object.assign({}, (option === null || option === void 0 ? void 0 : option.value) || {}, value) });
                                            return result;
                                        }));
                                        sub_total +=
                                            ((_e = options[0]) === null || _e === void 0 ? void 0 : _e.value.price.amount) || product.main_price;
                                        meta[productId] = {
                                            vendor_commission: product === null || product === void 0 ? void 0 : product.vendor_commission,
                                            vendor_price: product === null || product === void 0 ? void 0 : product.vendor_price,
                                        };
                                        total = +sub_total;
                                        return {
                                            sku: item === null || item === void 0 ? void 0 : item.sku,
                                            quantity: item === null || item === void 0 ? void 0 : item.quantity,
                                            thumbnail: item === null || item === void 0 ? void 0 : item.thumbnail,
                                            product,
                                            options,
                                        };
                                    }
                                    else {
                                        // console.log("not found ", product?.id);
                                        console.log("not found ", product);
                                        return null;
                                    }
                                }
                                catch (error) {
                                    console.error("Error fetching product:", error);
                                    return null;
                                }
                            })));
                            const validItems = items.filter((item) => item !== null);
                            if (validItems.length) {
                                order.items = validItems;
                                order.amounts = {
                                    total: {
                                        amount: total,
                                    },
                                };
                                yield order.save();
                            }
                            else {
                                yield Order_model_1.Order.findByIdAndDelete(order.id).then(() => console.log("order deleted " + order.id));
                            }
                        }
                    }
                }));
            }
            paginateOptions.page++;
            yield new Promise((resolve) => setTimeout(resolve, 10000));
        } while (orders.length === paginateOptions.limit);
    }
    catch (error) {
        console.log("error", error, error.response);
        // throw new ApiError('500',error)
    }
}));
