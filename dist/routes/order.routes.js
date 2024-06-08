"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = __importDefault(require("../assits/Authentication"));
const EditCustomerData_1 = require("../controllers/orders/EditCustomerData");
const GetUserOrders_1 = require("../controllers/orders/GetUserOrders");
const PlaceOrder_1 = require("../controllers/orders/PlaceOrder");
const Router = require("express").Router;
const orderRoutes = Router();
orderRoutes.get("/getOrder", [(0, Authentication_1.default)()], GetUserOrders_1.GetUserOrders);
orderRoutes.post("/getOrderDetails", [(0, Authentication_1.default)()], GetUserOrders_1.GetUserOrderDetails);
orderRoutes.post("/sendOrder", [(0, Authentication_1.default)()], PlaceOrder_1.SendOrder);
orderRoutes.patch("/editCustomer", [(0, Authentication_1.default)()], EditCustomerData_1.EditCustomerData);
exports.default = orderRoutes;
