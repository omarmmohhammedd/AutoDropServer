import { NextFunction, Request, Response } from "express";
import SallaToken from "../../../models/SallaTokenModel";
import catchAsync from "../../../utils/catchAsync";
import axios from "axios";

export const GetAllCategories = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    const salla = await SallaToken.findById(req.user.sallaToken);
    if (!salla) {
        return res.status(404).json({ message: 'Salla token not found' });
      }
  
    const { accessToken } = salla;
    const categoriesFetch = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      url: "https://api.salla.dev/admin/v2/categories",
    };
    const categories = await axios.request(categoriesFetch);
    let categoriesData= categories.data.data.map((category: any) => {let{id,name}=category;return {name,id}});
    res.status(200).json({
      status: "success",
      data: categoriesData,
    });
  }
);
