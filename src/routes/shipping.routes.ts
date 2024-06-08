
import { Router } from "express";
import { GetShippingProductIdCountryCode } from "../controllers/aliexpress/products/shipping/GetCountryShippping";
import { GetNewShipping } from "../controllers/aliexpress/products/shipping/GetProductsShipping";
import Authentication from "../assits/Authentication";

const shippingRoutes = Router();



shippingRoutes.post("/country",[Authentication()],GetShippingProductIdCountryCode)
shippingRoutes.post("/new",[Authentication()],GetNewShipping)





export default shippingRoutes;
