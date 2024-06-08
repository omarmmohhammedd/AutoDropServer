"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GetProducts_controller_1 = require("../controllers/aliexpress/GetProducts.controller");
const GetProductsShipping_1 = require("../controllers/aliexpress/products/shipping/GetProductsShipping");
const Authentication_1 = __importDefault(require("../assits/Authentication"));
const CRUD_1 = require("../controllers/aliexpress/products/productCRUD/CRUD");
const CheckValidation_1 = require("../validate/CheckValidation");
const products_1 = require("../validate/products");
const createProduct_1 = require("../controllers/aliexpress/products/productCRUD/createProduct");
const getUserProducts_1 = require("../controllers/aliexpress/products/productCRUD/getUserProducts");
const LinkProduct_1 = require("../controllers/aliexpress/products/productCRUD/LinkProduct");
const DeleteProduct_1 = require("../controllers/aliexpress/products/productCRUD/DeleteProduct");
const GetProductInfo_1 = __importDefault(require("../controllers/aliexpress/products/productCRUD/GetProductInfo"));
const PatchProduct_1 = __importDefault(require("../controllers/aliexpress/products/productCRUD/PatchProduct"));
const router = (0, express_1.Router)();
router.get("/products", GetProducts_controller_1.GetRecommendedProducts);
router.post("/products", GetProducts_controller_1.GetRecommendedProductsPost);
router.get("/productsByName", GetProducts_controller_1.GetProductByName);
// router.post("/getProductDetails", GetProductDetails);
router.post("/getProductDetails/v2", [(0, Authentication_1.default)()], GetProducts_controller_1.GetProductDetailsTest);
router.post("/getShippingDetails", GetProductsShipping_1.GetProductShippingDetailsByID);
//delete later
router.post("/product/create", [(0, Authentication_1.default)(), ...products_1.CreateProduct, CheckValidation_1.CheckValidationSchema], CRUD_1.CreateProductController);
//here
router.post("/product/createProduct", [(0, Authentication_1.default)(), ...products_1.CreateProduct, CheckValidation_1.CheckValidationSchema], createProduct_1.CreateAndSaveProduct);
// router.post("/product/linkProductSalla", [Authentication()], LinkProductSalla);
router.post("/product/linkProductSalla/v2", [(0, Authentication_1.default)()], LinkProduct_1.LinkProductSalla2);
router.get("/product/getProducts", [(0, Authentication_1.default)()], getUserProducts_1.getUserProducts);
router.delete("/product/deleteProduct/:productId", [(0, Authentication_1.default)()], DeleteProduct_1.DeleteProductById);
router.patch("/product/updateProduct/:productId", [(0, Authentication_1.default)()], PatchProduct_1.default);
router.get("/product/getProductInfo/:productId", [(0, Authentication_1.default)()], GetProductInfo_1.default);
exports.default = router;
