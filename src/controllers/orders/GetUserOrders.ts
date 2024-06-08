import catchAsync from '../../utils/catchAsync';
import { Request,Response,NextFunction } from 'express';
import AppError from '../../utils/appError';
import {Order, OrderDocument} from '../../models/Order.model';
const GetUserOrders = catchAsync(async (req:Request&any, res:Response,next:NextFunction) => {

    let merchant = req.user._id.toString()
    if(!merchant){
        return next(new AppError('You are not authorized to perform this action', 403))
    }
    let userOrders = await Order.find({merchant})
    // .select()
   /*  if(!userOrders || userOrders.length == 0){

        return res.json({
            status: 'fail',
            message: 'No orders found'
        })
    } */
    return res.status(200).json({
        status: 'success',
        data: userOrders
    })
})
const GetUserOrderDetails = catchAsync(async (req:Request&any, res:Response,next:NextFunction) => {
    let merchant = req.user._id.toString()
    let {order_id} = req.body
    console.log('order_id',order_id)
    console.log('req.body',req.body)
    let userOrderDetails :OrderDocument|null= await Order.findOne({order_id})

    if(!userOrderDetails) return next(new AppError('Order not found', 404))
if(merchant !== userOrderDetails.merchant){
    return next(new AppError('You are not authorized to perform this action', 403))
}
 
    return res.status(200).json({
        status: 'success',
        data: userOrderDetails
    })
})

export  {GetUserOrders,GetUserOrderDetails}