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
exports.GetUserOrderDetails = exports.GetUserOrders = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = __importDefault(require("../../utils/appError"));
const Order_model_1 = require("../../models/Order.model");
const GetUserOrders = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let merchant = req.user._id.toString();
    if (!merchant) {
        return next(new appError_1.default('You are not authorized to perform this action', 403));
    }
    let userOrders = yield Order_model_1.Order.find({ merchant });
    // .select()
    /*  if(!userOrders || userOrders.length == 0){
 
         return res.json({
             status: 'fail',
             message: 'No orders found'
         })
     } */
    return res.status(200).json({
        status: 'success',
        data: userOrders
    });
}));
exports.GetUserOrders = GetUserOrders;
const GetUserOrderDetails = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let merchant = req.user._id.toString();
    let { order_id } = req.body;
    console.log('order_id', order_id);
    console.log('req.body', req.body);
    let userOrderDetails = yield Order_model_1.Order.findOne({ order_id });
    if (!userOrderDetails)
        return next(new appError_1.default('Order not found', 404));
    if (merchant !== userOrderDetails.merchant) {
        return next(new appError_1.default('You are not authorized to perform this action', 403));
    }
    return res.status(200).json({
        status: 'success',
        data: userOrderDetails
    });
}));
exports.GetUserOrderDetails = GetUserOrderDetails;
