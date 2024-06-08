import { NextFunction, Request, Response } from "express";
import SallaToken from "../../../models/SallaTokenModel";
import catchAsync from "../../../utils/catchAsync";
import axios from "axios";
import { Product } from "../../../models/product.model";

export const DeleteSallaProduct = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    const salla_product_id = req.params.sallaProductId;
    const salla = await SallaToken.findById(req.user.sallaToken);
    if (!salla) {
      return res.status(404).json({ message: "Salla token not found" });
    }

    const { accessToken } = salla;
    const deleteSallaProductOpt = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      url: `https://api.salla.dev/admin/v2/products/${salla_product_id}`,
    };
    const { data: deleteResp } = await axios.request(deleteSallaProductOpt);
    if (!deleteResp.success) {
      return res.status(400).json({
        status: "failed",
      });
    }
    let product = await Product.findOne({
      salla_product_id,
      merchant: req.user._id.toString(),
    });
    console.log(product);
    if (!product) {
      return res.status(404).json({
        status: "failed",
        message: "Cannot find product",
      });
    }
    if (product) {
      product.salla_product_id = undefined;
      await product.save();
    }
    console.log(deleteResp.success);
    return res.status(200).json({
      status: "success",
    });
  }
);
