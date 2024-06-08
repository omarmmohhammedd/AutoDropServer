"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GetCountryShippping_1 = require("../controllers/aliexpress/products/shipping/GetCountryShippping");
const GetProductsShipping_1 = require("../controllers/aliexpress/products/shipping/GetProductsShipping");
const Authentication_1 = __importDefault(require("../assits/Authentication"));
const shippingRoutes = (0, express_1.Router)();
shippingRoutes.post("/country", [(0, Authentication_1.default)()], GetCountryShippping_1.GetShippingProductIdCountryCode);
shippingRoutes.post("/new", [(0, Authentication_1.default)()], GetProductsShipping_1.GetNewShipping);
exports.default = shippingRoutes;
