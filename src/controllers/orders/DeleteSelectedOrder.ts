import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/appError";
import { Order, OrderDocument } from "../../models/Order.model";
const DeleteSelectedOrder = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    let merchant = req.user._id.toString();
    let { order_id } = req.body;
    if (!merchant) {
      return next(
        new AppError("You are not authorized to perform this action", 403)
      );
    }
    let order = await Order.findOne({ merchant, order_id });
if(!order){
return next(new AppError("give order not found",404))
}
    await Order.findByIdAndDelete(order._id);

    return res.status(200).json({
      status: "success",
      message: "Selected Order deleted successfully",
    });
  }
);
