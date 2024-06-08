import { Request, Response } from "express";
import AliExpressToken from "../models/AliExpressTokenModel";
import User from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import SallaToken from "../models/SallaTokenModel";

export const deleteAliExpressToken = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id);

    // Delete the AliExpressToken document
    await AliExpressToken.findByIdAndDelete(id);
    // Remove the reference from the User document
    await User.updateOne(
      { aliExpressToken: id },
      { $unset: { aliExpressToken: "" } }
    );

    res.status(200).json({ message: "AliExpressToken deleted successfully" });
  }
);
export const deleteSallaToken = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delete the AliExpressToken document
    await SallaToken.findByIdAndDelete(id);
    // Remove the reference from the User document
    await User.updateOne({ sallaToken: id }, { $unset: { sallaToken: "", merchantID: "" ,storeName:'',storeLink:''} });
    res.status(200).json({ message: "AliExpressToken deleted successfully" });
  }
);
