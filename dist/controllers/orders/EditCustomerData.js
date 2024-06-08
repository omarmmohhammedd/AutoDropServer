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
exports.EditCustomerData = void 0;
const Order_model_1 = require("../../models/Order.model");
const appError_1 = __importDefault(require("../../utils/appError"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
exports.EditCustomerData = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let _a = req.body, { order_id } = _a, CustomerData = __rest(_a, ["order_id"]);
    const order = yield Order_model_1.Order.findOne({ order_id });
    if (!order) {
        return next(new appError_1.default("Order Not Found", 404));
    }
    console.log("CustomerData", CustomerData);
    if (CustomerData) {
        let { firstName: first_name, lastName: last_name, mobile, mobile_code, email, country, address, postalCode: postal_code, region } = CustomerData;
        // order.order_memo = order_memo;
        /* order.customer.first_name = first_name
        order.customer.last_name = last_name
        
        
        order.customer.mobile = mobile
        order.customer.mobile_code = mobile_code
        order.customer.country = country
        order.customer.address = address
        order.customer.postal_code = postal_code */
        order.customer.set('first_name', first_name);
        order.customer.set('last_name', last_name);
        order.customer.set('mobile', mobile);
        order.customer.set('mobile_code', mobile_code);
        order.customer.set('email', email);
        order.customer.set('country', country);
        order.customer.set('address', address);
        order.customer.set('region', region);
        // order.shipping.address.set('postal_code', postal_code);
        // order.shipping.address.set('street_number', address);
        const orderJSON = order.toJSON();
        let shippingAddress = Object.assign(Object.assign({}, orderJSON.shipping.address), { street_number: address, postal_code: postal_code });
        order.shipping.set("address", shippingAddress);
        // order.shipping.address.street_number = address;
        // order.shipping.address.postal_code = postal_code;
        order.markModified('customer');
        yield order.save().catch((error) => console.error(error));
    }
    // const placeOrderResult = await PlaceOrder(order, order_memo);
    return res.json({ message: "update user data success" });
}));
