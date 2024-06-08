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
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const appError_1 = __importDefault(require("../../utils/appError"));
const Order_model_1 = require("../../models/Order.model");
const DeleteSelectedOrder = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let merchant = req.user._id.toString();
    let { order_id } = req.body;
    if (!merchant) {
        return next(new appError_1.default("You are not authorized to perform this action", 403));
    }
    let order = yield Order_model_1.Order.findOne({ merchant, order_id });
    if (!order) {
        return next(new appError_1.default("give order not found", 404));
    }
    yield Order_model_1.Order.findByIdAndDelete(order._id);
    return res.status(200).json({
        status: "success",
        message: "Selected Order deleted successfully",
    });
}));
