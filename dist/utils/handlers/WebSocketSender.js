"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketSendError = exports.WebSocketSender = void 0;
const axios_1 = __importDefault(require("axios"));
const WebSocketSender = (subscription) => {
    if (!subscription)
        return console.error("Subscription not found");
    let webSocketReq = {
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
    axios_1.default.request(webSocketReq);
};
exports.WebSocketSender = WebSocketSender;
const WebSocketSendError = (webSocketError, userId) => {
    let webSocketReq = {
        url: `${process.env.Backend_Link}websocketHandler`,
        /*     data: {
              event: "app.subscription.renewed",
            }, */
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    };
    if (!webSocketError)
        return console.error("webSocketError not found");
    if (webSocketError === "subscription-expired") {
        webSocketReq.data = {
            event: "subscription-expired"
        };
    }
    else if (webSocketError === "subscription-orders-limit-reached") {
        webSocketReq.data = {
            event: "subscription-orders-limit-reached"
        };
    }
    else if (webSocketError === "subscription-products-limit-reached") {
        webSocketReq.data = {
            event: "subscription-products-limit-reached"
        };
    }
    else if (webSocketError === "merchant-already-connected") {
        webSocketReq.data = {
            event: "merchant-already-connected"
        };
    }
    else {
        webSocketReq.data = {
            event
        };
    }
    webSocketReq.data.userId = userId;
    axios_1.default.request(webSocketReq);
    return;
};
exports.WebSocketSendError = WebSocketSendError;
