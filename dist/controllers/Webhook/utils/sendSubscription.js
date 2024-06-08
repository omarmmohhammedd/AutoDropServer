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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSubscriptionError = exports.sendSubscription = void 0;
const sendSubscription = (subscription, plan, userId, clients, WebSocket) => __awaiter(void 0, void 0, void 0, function* () {
    /* if (!plan) {
      plan = await Plan.findById(subscription.plan);
      if(!plan) return console.error("Plan not found");
    } */
    console.log("subscription is ", subscription);
    // const subscriptionJSON = subscription.toJSON();
    let subscriptionToBeSent = subscription;
    subscriptionToBeSent.planName = plan.name;
    subscriptionToBeSent.eventType = "subscription";
    subscriptionToBeSent.subscriptionStart = subscription.start_date;
    subscriptionToBeSent.subscriptionExpiry = subscription.expiry_date;
    subscriptionToBeSent.subscriptionOrdersLimit = subscription.orders_limit;
    subscriptionToBeSent.subscriptionProductsLimit = subscription.products_limit;
    subscriptionToBeSent.totalOrdersLimit = plan.orders_limit;
    subscriptionToBeSent.totalProductsLimit = plan.products_limit;
    // let dataToBeSent = subscriptionJSON
    // const subscriptionParam =JSON.stringify(subscriptionJSON)
    const client = clients[userId];
    const sendClient = () => {
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(subscriptionToBeSent));
            return true;
        }
        else {
            console.error("Failed to send message: client not connected");
            return false;
        }
    };
    sendClient();
    return;
});
exports.sendSubscription = sendSubscription;
const sendSubscriptionError = (event, userId, clients, WebSocket) => __awaiter(void 0, void 0, void 0, function* () {
    const client = clients[userId];
    const sendClient = () => {
        let subscriptionToBeSent = { eventType: event };
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(subscriptionToBeSent));
            return true;
        }
        else {
            console.error("Failed to send message: client not connected");
            return false;
        }
    };
    sendClient();
    return;
});
exports.sendSubscriptionError = sendSubscriptionError;
