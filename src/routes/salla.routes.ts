import Authentication from "../assits/Authentication";
import { GetAllCategories } from "../controllers/salla/categories/GetAllCategories";
import { GetAllProductsCategories } from "../controllers/salla/categories/GetAllProductsCategories";
import { GetAllTags } from "../controllers/salla/tags/GetAllTags";
import { DeleteSallaProduct } from "../controllers/salla/products/DeleteSallaProduct";
import { RefreshTokenHandler } from "../controllers/salla/RefreshAccessToken";

const Router = require("express").Router;

const sallaRoutes = Router();
sallaRoutes.get("/categories", [Authentication()], GetAllCategories);
sallaRoutes.get("/tags", [Authentication()], GetAllTags);
sallaRoutes.delete(
  "/deleteProduct/:sallaProductId",
  [Authentication()],
  DeleteSallaProduct
);

sallaRoutes.patch(
  "/refreshToken/:accessToken",
  [Authentication()],
  RefreshTokenHandler
);

sallaRoutes.get("/getProductsCategories/", [Authentication()] ,GetAllProductsCategories)


export default sallaRoutes;
