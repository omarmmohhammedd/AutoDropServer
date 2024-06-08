import { NextFunction, Request, Response } from "express";
import SallaToken from "../../../models/SallaTokenModel";
import catchAsync from "../../../utils/catchAsync";
import axios from "axios";
import { Product } from "../../../models/product.model";

export const GetAllProductsCategories = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
 
 let productsCategories = await Product.find({merchant:req.user._id.toString()}).select("categoriesSalla -_id")    
    res.status(200).json({
      status: "success",
      data: productsCategories,
    });
  }
);
