"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = __importDefault(require("../assits/Authentication"));
const subscriptionInquiry_1 = require("../controllers/subscriptionInquiry");
const Router = require("express").Router;
const subscriptionRoutes = Router();
subscriptionRoutes.get("/getRemainingProducts", [(0, Authentication_1.default)()], subscriptionInquiry_1.GetRemainingProducts);
exports.default = subscriptionRoutes;
