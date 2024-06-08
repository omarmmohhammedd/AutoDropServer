import express, { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import { newComparePassword, newHashPassword, verifyAccessToken } from "../utils/authHelperFunction";
import catchAsync from "../utils/catchAsync";
import TokenUserExtractor from "../utils/handlers/tokenUserExtractor";
import { compare } from "bcrypt";
const router = express.Router();

router.post(
  "/change-password",
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let { currentPassword, newPassword, confirmPassword } = req.body;
    console.log(req.body);

    let user = await TokenUserExtractor(req);
    console.log(user);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    console.log("password matched");

    // let isMatch = await user.comparePassword(currentPassword);
    console.log(req.body);
    let isMatch = await newComparePassword(currentPassword, user.password);
    let newPass = await newHashPassword(newPassword);
    // let isMatch = await compare(currentPassword, user.password);
    console.log(isMatch);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPass;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  })
);

export default router;
