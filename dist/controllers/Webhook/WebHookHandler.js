"use strict";
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
const WebHookEvents_1 = __importDefault(require("./WebHookEvents"));
const events = new WebHookEvents_1.default();
function WebHookHandler(req, res, next, clients, WebSocket) {
    try {
        const body = req.body;
        const { event } = body, other = __rest(body, ["event"]);
        console.log("WebHook: salla event triggred => ", event);
        switch (event) {
            case "app.store.authorize":
                return events.AuthorizeEvent(body, res, next);
            case "app.installed":
                return events.CreateNewApp(body, res, next);
            case "app.uninstalled":
                return events.RemoveApp(body, res, next);
            case "app.expired":
            case "app.updated":
            case "order.deleted":
                return events.DeleteSelectedOrder(body, res, next);
            case "order.created":
                return events.CreateNewOrder(body, res, next);
            case "order.status.updated":
                return events.UpdateOrderStatus(body, res, next);
            case "product.deleted":
                return events.DeleteSelectedProduct(body, res, next);
            case "order.deleted":
                return events.DeleteSelectedOrder(body, res, next);
            case 'app.subscription.renewed':
            case 'app.subscription.started':
                return events.makeSubscription(body, res, next, clients, WebSocket);
            case 'app.trial.started':
                return events.freeTrial(body, res);
            case 'app.trial.expired':
                return events.deleteFree(body, res);
            case 'app.subscription.expired':
                return events.deletePlan(body, res);
            case 'product.updated':
                return events.updateProduct(body, res);
            default:
                return true;
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}
exports.default = WebHookHandler;
