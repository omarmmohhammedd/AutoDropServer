import { Request } from "express";
import { verifyAccessToken } from "../authHelperFunction";
import User from "../../models/user.model";

export default async function TokenUserExtractor(req: Request) {
  let token = req.headers.authorization?.split(" ")[1];
  let tokenValid = await verifyAccessToken(token!);
  if (!tokenValid) {
    return null;
  }
  if(tokenValid.id){
    let user = await User.findOne({ _id: tokenValid.id });
    return user;

  }else {
    let user = await User.findOne({ _id: tokenValid._id });
    return user;
  }

}
