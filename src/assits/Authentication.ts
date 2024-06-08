import { Request, Response, NextFunction } from "express";

import axios from "axios";
import AppError from "../utils/appError";
import { verifyAccessToken } from "../utils/authHelperFunction";
import TokenUserExtractor from "../utils/handlers/tokenUserExtractor";
import { method } from "lodash";

type Roles = "admin" | "vendor";

const Authentication =
  (role?: Roles) =>
  async (req: Request & any, res: Response & any, next: NextFunction) => {
    try {
      let result: any;
      const token = req.headers["authorization"];

      if (!token) throw new AppError("Token is required", 401);
      
      const matched = await verifyAccessToken(token.replace(/Bearer /, ""));
      if (!matched) throw new AppError("token is invalid", 401);

      if (role === "admin" && matched?.userType === "vendor")
        throw new AppError("You do not have any access to do this action", 401);

      let user: any = await TokenUserExtractor(req);
 

      // return error if account not found
      if (!user) throw new AppError("User Not Found", 404);

      // console.log(req.session);

      // req.session.user = result;
      req.user = user;

      return next();
    } catch (error) {
      next(error);
    }
  };
export default Authentication;
