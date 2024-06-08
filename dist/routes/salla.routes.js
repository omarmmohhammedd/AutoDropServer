"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = __importDefault(require("../assits/Authentication"));
const GetAllCategories_1 = require("../controllers/salla/categories/GetAllCategories");
const GetAllProductsCategories_1 = require("../controllers/salla/categories/GetAllProductsCategories");
const GetAllTags_1 = require("../controllers/salla/tags/GetAllTags");
const DeleteSallaProduct_1 = require("../controllers/salla/products/DeleteSallaProduct");
const RefreshAccessToken_1 = require("../controllers/salla/RefreshAccessToken");
const Router = require("express").Router;
const sallaRoutes = Router();
sallaRoutes.get("/categories", [(0, Authentication_1.default)()], GetAllCategories_1.GetAllCategories);
sallaRoutes.get("/tags", [(0, Authentication_1.default)()], GetAllTags_1.GetAllTags);
sallaRoutes.delete("/deleteProduct/:sallaProductId", [(0, Authentication_1.default)()], DeleteSallaProduct_1.DeleteSallaProduct);
sallaRoutes.patch("/refreshToken/:accessToken", [(0, Authentication_1.default)()], RefreshAccessToken_1.RefreshTokenHandler);
sallaRoutes.get("/getProductsCategories/", [(0, Authentication_1.default)()], GetAllProductsCategories_1.GetAllProductsCategories);
exports.default = sallaRoutes;
