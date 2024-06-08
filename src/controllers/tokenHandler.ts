import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User from "../models/user.model";
import AliExpressToken from "../models/AliExpressTokenModel";
import SallaToken from "../models/SallaTokenModel";
import SallaRequest from '../utils/handlers/SallaRequest';

export const saveTokenToUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log("here");
    const { accessToken, refreshToken, userId, tokenType } = req.body;
    if (!accessToken || !refreshToken || !userId || !tokenType) {
      return next(
        new AppError(
          "Please provide access token, refresh token, user id and token type",
          400
        )
      );
    }

    let token;
    if (tokenType === "AliExpress") {
      // Create a new AliExpressToken document
      await AliExpressToken.deleteMany({ userId });
      token = new AliExpressToken({ accessToken, refreshToken, userId });
      await token.save();
      // console.log(token)
    } else if (tokenType === "Salla") {
      // Create a new SallaToken document
      await SallaToken.deleteMany({ userId });
      token = new SallaToken({ accessToken, refreshToken, userId });
      await token.save();
    } else {
      return next(new AppError("Invalid token type", 400));
    }
    
    

    // Update the user's token field
    let update = {};
    switch (tokenType) {
      case "AliExpress":
        update = { aliExpressToken: token._id };
        break;
      case "Salla":
        update = { sallaToken: token._id };
        break;
      // Add more cases as needed
      default:
        return next(new AppError("Invalid token type", 400));
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
if(tokenType == "Salla"){
  // get merchantID and save it to user 
  
  try{
let sallaReqOptUser = {
  method:"GET",
  url:"/oauth2/user/info",
  token:accessToken,

}
let sallaReqOptStore = {
  method:"GET",
  url:"/store/info",
  token:accessToken,

}
    let [userSallaInfo,storeSallaInfo] = await Promise.allSettled([SallaRequest(sallaReqOptUser)  ,SallaRequest(sallaReqOptStore)  ])
 if(userSallaInfo.status == "fulfilled"){
let {data } = userSallaInfo.value
let merchantID = data.data.merchant.id
user.merchantID = merchantID
await user.save()
  // console.log("merchantID stored",merchantID)
}else{
    // console.log(userSallaInfo.reason)
 }
 if(storeSallaInfo.status == "fulfilled"){
  let {data } = storeSallaInfo.value
  let storeName = data.data.name
  let storeLink = data.data.domain
  user.storeName = storeName
  user.storeLink = storeLink
  await user.save()
  // console.log("storeName stored",storeName)
 }else{
    // console.log(storeSallaInfo.reason)
 }
  }catch(err:any){
    console.error(err)
  }
}
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);
