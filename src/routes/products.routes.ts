import { Router } from "express";
import {
  GetProductByName,
  GetRecommendedProducts,
  GetRecommendedProductsPost,GetProductDetailsTest
} from "../controllers/aliexpress/GetProducts.controller";
import { GetProductShippingDetailsByID } from "../controllers/aliexpress/products/shipping/GetProductsShipping";
import Authentication from "../assits/Authentication";
import { CreateProductController } from "../controllers/aliexpress/products/productCRUD/CRUD";
import { CheckValidationSchema } from "../validate/CheckValidation";
import { CreateProduct } from "../validate/products";
import { CreateAndSaveProduct } from "../controllers/aliexpress/products/productCRUD/createProduct";
import { getUserProducts } from "../controllers/aliexpress/products/productCRUD/getUserProducts";
import { LinkProductSalla2 } from "../controllers/aliexpress/products/productCRUD/LinkProduct";
import { DeleteProductById } from "../controllers/aliexpress/products/productCRUD/DeleteProduct";
import GetProductInfo from "../controllers/aliexpress/products/productCRUD/GetProductInfo";
import PatchProduct from "../controllers/aliexpress/products/productCRUD/PatchProduct";
const router = Router();
router.get("/products", GetRecommendedProducts);
router.post("/products", GetRecommendedProductsPost);
router.get("/productsByName", GetProductByName);
// router.post("/getProductDetails", GetProductDetails);
router.post("/getProductDetails/v2", [Authentication()],GetProductDetailsTest);



router.post("/getShippingDetails", GetProductShippingDetailsByID);
//delete later
router.post(
  "/product/create",
  [Authentication(), ...CreateProduct, CheckValidationSchema],
  CreateProductController
);
//here

router.post(
  "/product/createProduct",
  [Authentication(), ...CreateProduct, CheckValidationSchema],
  CreateAndSaveProduct
);
// router.post("/product/linkProductSalla", [Authentication()], LinkProductSalla);
router.post(
  "/product/linkProductSalla/v2",
  [Authentication()],
  LinkProductSalla2
);
router.get("/product/getProducts", [Authentication()], getUserProducts);
router.delete(
  "/product/deleteProduct/:productId",
  [Authentication()],
  DeleteProductById
);
router.patch(
  "/product/updateProduct/:productId",
  [Authentication()],
  PatchProduct
);
router.get(
  "/product/getProductInfo/:productId",
  [Authentication()],
  GetProductInfo
);
export default router;
