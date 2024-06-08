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
exports.CreateProduct = exports.DeleteProduct = exports.GetDetails = void 0;
const product_model_1 = require("../models/product.model");
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const user_model_1 = __importDefault(require("../models/user.model"));
const GetDetails = [
    (0, express_validator_1.body)("url")
        .exists()
        .withMessage("URL is required")
        .isURL()
        .withMessage("Invalid url"),
];
exports.GetDetails = GetDetails;
const DeleteProduct = [
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("product is required")
        .isMongoId()
        .withMessage("Invalid id")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        if (!value)
            return;
        if (!(0, mongoose_1.isValidObjectId)(value))
            return;
        const product = yield product_model_1.Product.findById(value).exec();
        if (!product)
            throw new Error("Product not found");
        return false;
    })),
];
exports.DeleteProduct = DeleteProduct;
const CreateProduct = [
    (0, express_validator_1.body)("name").exists().withMessage("name required"),
    (0, express_validator_1.body)("price").exists().withMessage("price required"),
    (0, express_validator_1.body)("quantity")
        .exists()
        .withMessage("quantity required")
        .isNumeric()
        .withMessage("Should be type of number")
        .isLength({ min: 1 })
        .withMessage("Min quantity should be 1"),
    (0, express_validator_1.body)("sku").exists().withMessage("sku required"),
    (0, express_validator_1.body)("merchant").custom((val_1, _a) => __awaiter(void 0, [val_1, _a], void 0, function* (val, { req }) {
        const role = req.user.role;
        if (role === "admin") {
            if (!val)
                throw new Error("merchant is required");
            if (!(0, mongoose_1.isValidObjectId)(val))
                throw new Error("Invalid id");
            const vendor = yield user_model_1.default.findById(val).exec();
            if (!vendor)
                throw new Error("Invalid vendor");
        }
        return true;
    })),
];
exports.CreateProduct = CreateProduct;
