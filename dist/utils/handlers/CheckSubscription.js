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
exports.CheckSubscription = void 0;
const moment_1 = __importDefault(require("moment"));
const appError_1 = __importDefault(require("../appError"));
const Subscription_model_1 = require("../../models/Subscription.model");
const WebSocketSender_1 = require("./WebSocketSender");
const Setting_model_1 = __importDefault(require("../../models/Setting.model"));
const turnOffSyncProdAndQuantity = (user) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("user is ", user);
    const settingDoc = yield Setting_model_1.default.findOne({ userId: user });
    if (!settingDoc)
        return;
    settingDoc.syncProdPrices = false;
    settingDoc.syncProdQuantities = false;
    yield settingDoc.save();
});
function CheckSubscription(user, key) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const subscription = yield Subscription_model_1.Subscription.findOne({ user })
                    .populate("plan")
                    .exec();
                if (!subscription)
                    throw new appError_1.default("You do not have any subscription to be able to do this process, subscribe to one of our awesome plans then try again later.", 400);
                const requiredSearchKey = subscription[key];
                const requiredPlanSearch = subscription.plan[key];
                const remainingFromExpire = (0, moment_1.default)(subscription.expiry_date).diff((0, moment_1.default)(), "days", true);
                console.log("remainingFromExpire", remainingFromExpire);
                // throw error when current subscription expired
                let sendToClient = true;
                if (((_a = subscription === null || subscription === void 0 ? void 0 : subscription.plan) === null || _a === void 0 ? void 0 : _a.name) !== "Basic" && !remainingFromExpire) {
                    sendToClient = false;
                    (0, WebSocketSender_1.WebSocketSendError)("subscription-expired", user);
                    turnOffSyncProdAndQuantity(user);
                    throw new appError_1.default("Your subscription has been ended, please upgrade it then try again later", 400);
                }
                // throw error when current subscription limit ended
                console.log("requiredSearchKey", requiredSearchKey);
                if (requiredSearchKey <= 0) {
                    sendToClient = false;
                    if (key == "products_limit") {
                        (0, WebSocketSender_1.WebSocketSendError)("subscription-products-limit-reached", user);
                        turnOffSyncProdAndQuantity(user);
                    }
                    else {
                        (0, WebSocketSender_1.WebSocketSendError)("subscription-orders-limit-reached", user);
                        turnOffSyncProdAndQuantity(user);
                    }
                    throw new appError_1.default("You cannot do this process at that moment, upgrade your subscription first.", 400);
                }
                /*      let webSocketReq = {
                       url: `${process.env.Backend_Link}websocketHandler`,
                       data: {
                         event: "app.subscription.renewed",
                         subscription: subscription,
                       },
                       headers: {
                         "Content-Type": "application/json",
                       },
                       method: "POST",
                     };
                     axios.request(webSocketReq); */
                if (sendToClient)
                    (0, WebSocketSender_1.WebSocketSender)(subscription);
                // sendSubscription(subscription, null, user, clients, WebSocket);
                // unlimited items
                if (requiredSearchKey === null && requiredPlanSearch === null)
                    return resolve(subscription);
                resolve(subscription);
                // if(subscription[])
            }
            catch (error) {
                console.log("error", error);
                reject(error);
            }
        }));
    });
}
exports.CheckSubscription = CheckSubscription;
