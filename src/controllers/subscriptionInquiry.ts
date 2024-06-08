import { NextFunction, Response } from "express";
import { Subscription } from "../models/Subscription.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";


export const GetRemainingProducts = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
        let subscription = await Subscription.findById(req?.user?.subscription);
        if(!subscription){ return next(new AppError("Subscription Not Found", 404));}
     let {products_limit} = subscription;
     
      return res.json({ message: "user subscription found" ,remainingProducts:products_limit});
    }
  );
  