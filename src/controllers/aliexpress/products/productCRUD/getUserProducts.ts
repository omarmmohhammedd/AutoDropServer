import axios, { AxiosError } from "axios";
import AppError from "../../../../utils/appError";
import { Product, ProductSchema } from "../../../../models/product.model";
import { pick } from "lodash";
import SallaToken from "../../../../models/SallaTokenModel";
import { NextFunction, Request, Response } from "express";

export async function getUserProducts(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { role, _id } = req.user;
    console.log( req.user._id )
    console.log( typeof req.user._id )
    // const userProducts = await Product.find({ merchant: req.user._id });
    const userProducts = await Product.find({ merchant: req.user._id }).select('_id name price quantity first_level_category_name salla_product_id shippingAvailable productValuesNumber').slice('images', 1);
    return res.json({ userProducts, success: true });

  } catch (error: AxiosError | any) {
    const isAxiosError = error instanceof AxiosError;
    const values = error?.response?.data;
    console.log(error + "\n\n\n");
    console.log(values);
    console.log(values.error.fields);
    next(
      isAxiosError ? new AppError("UnprocessableEntity " + values, 400) : error
    );
  }
}
