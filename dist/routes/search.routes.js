"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SeachAliexpressProducts_1 = require("../controllers/aliexpress/products/Category/SeachAliexpressProducts");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const searchRoutes = (0, express_1.Router)();
// Aliexpress Routes
searchRoutes.post("/getProductByUrl/", SeachAliexpressProducts_1.GetRecommendedProductsByURL);
searchRoutes.post("/getRandomProductsImage/", upload.single('file'), SeachAliexpressProducts_1.GetRecommendedProductsByImage);
searchRoutes.post("/getRandomProductsCategory/", SeachAliexpressProducts_1.GetRecommendedProductsByCategory);
exports.default = searchRoutes;
