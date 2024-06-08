import Authentication from "../assits/Authentication";
import { EditCustomerData } from "../controllers/orders/EditCustomerData";

import { GetUserOrders,GetUserOrderDetails } from "../controllers/orders/GetUserOrders";
import { SendOrder } from "../controllers/orders/PlaceOrder";
const Router = require("express").Router;

const orderRoutes = Router();
orderRoutes.get("/getOrder", [Authentication()], GetUserOrders);
orderRoutes.post("/getOrderDetails", [Authentication()], GetUserOrderDetails);
orderRoutes.post("/sendOrder", [Authentication()], SendOrder);
orderRoutes.patch("/editCustomer", [Authentication()], EditCustomerData);



export default orderRoutes;
