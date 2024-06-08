import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import Setting from "../../models/Setting.model";
import User from "../../models/user.model";
export const getUserSettings = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    if (!req.user.setting) {
      throw new Error("User settings not found");
    }
    const setting = await Setting.findById(req.user.setting);
    if(setting){
      let {_id,__v,...settingWithoutIdAndVersion} = setting.toObject()
      return res.json({
        status: "success",
        data: settingWithoutIdAndVersion,
      });
    }
    return res.status(400).json({
      status: "fail",
      message: "Failed to get settings",
    });
  }
);

export const updateUserSettings = catchAsync(
    async (req: Request & any, res: Response, next: NextFunction) => {
        if (!req.user.setting) {
            throw new Error("User settings not found");
          }
        const setting = await Setting.findByIdAndUpdate(req.user.setting, req.body, {
      new: true,
        });
        if(setting){

          const { _id, __v, ...settingWithoutIdAndVersion } = setting.toObject();

          return res.json({
          status: "success",
          data: settingWithoutIdAndVersion,
          });
        }else{
          return res.status(400).json({
            status: "failed",
            message: "Failed to update settings",
            });
        }

    }
 
)

export const updateUserData = catchAsync(    async (req: Request & any, res: Response, next: NextFunction) => {
  console.log(req.body)
 await User.findByIdAndUpdate(req.user._id,{...req.body},{new:true}).then((user)=>res.status(201).json({user}))
})