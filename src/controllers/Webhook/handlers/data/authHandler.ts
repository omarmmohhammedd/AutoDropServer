import { VerifyToken } from "../token";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { Session } from "express-session";
import AppError from '../../../../utils/appError';
import User ,{IUserDocument}from '../../../../models/user.model';

type Roles = "admin" | "vendor";

const Authentication =
  (role?: Roles) =>
  async (
    req: Request & any & { session: Session },
    res: Response,
    next: NextFunction
  ) => {
    try {
      let result: any, account: IUserDocument | null;
      const token = req.headers["authorization"];

      if (!token) throw new AppError("Not found",404);

      const matched = await VerifyToken(token.replace(/Bearer /, ""));

      if (!matched) throw new AppError("Forbidden",403);

      if (role === "admin" && matched?.userType === "vendor")
        throw new AppError(
    "You do not have any access to do this action"
,403
        );

      account = await User.findOne(
        matched?.userType === "vendor"
          ? { merchantId: matched.merchant }
          : { _id: matched.userId }
      ).exec();

      // return error if account not found
      if (!account) throw new AppError("Not Found",404);

      if (matched?.userType === "vendor") {
        const access_token = CheckTokenExpire(matched?.token);

        // result.access_token = access_token;
        // result.merchant = matched.merchant;
        result = {
          access_token: access_token,
          merchant: matched.merchant,
        };
      }

      result = {
        ...result,
        user_id: account?.id,
        userType: matched?.userType,
      };

      // console.log(req.session);

      // req.session.user = result;
      req.local = result;

      return next();
    } catch (error) {
      next(error);
    }
  };

export function CheckTokenExpire(token: any) {
  let expired: boolean = false;
  const { access_token, expires, refresh_token } = JSON.parse(token);

  // 1680991559
  expired = new Date().getTime() > new Date(expires * 1000).getTime();

  return expired ? refresh_token : access_token;
}
export default Authentication;
