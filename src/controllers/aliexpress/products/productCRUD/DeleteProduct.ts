import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../utils/catchAsync";
import {
  Product,
  ProductDocument,
  ProductSchema,
} from "../../../../models/product.model";
import axios from "axios";
import SallaToken from "../../../../models/SallaTokenModel";

export const DeleteProductById = catchAsync(
  async (req: Request &any, res: Response, next: NextFunction) => {
    if (!req.params) {
      return res
        .status(400)
        .json({ message: "Missing productId in query parameters." });
    }
    //@ts-ignore
    let { productId }: { productId: string } = req.params;
console.log("productId",productId)
    let product: ProductDocument | null = await Product.findOne({
      //@ts-ignore
      merchant: req.user._id as any,
      _id: productId,
    });
console.log("product",product)

 
    if (!product) {
      console.log("No product found");
      return res.status(404).json({ message: "Product Not Found." });
    }
    if (product?.salla_product_id) {
      try{
        const sallaTokenDocument = await SallaToken.findOne({
          _id: req.user.sallaToken,
        });
    
        if (!sallaTokenDocument || !req.user.sallaToken ) {
          return res.status(404).json({ message: "SallaToken Not Found." });
        }
      }catch(e:any){
        console.log(e)
      }
 
      let axiosOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers["authorization"],
        },
        url: `  ${process.env.Backend_Link}salla/deleteProduct/${product.salla_product_id}`,
      };
      try{

        let { data: deleteResp } = await axios.request(axiosOptions);
  
        if (!res.headersSent && deleteResp.status !== "success") {
          return res.status(400).json({
            status: "failed",
          });
        }
      } catch(e:any){

      }
      product.salla_product_id = undefined;
    }
    await Product.deleteOne({ _id: product._id });
    if (!res.headersSent) {
      return res.json({ message: "Product deleted" });
    }
  }
);
