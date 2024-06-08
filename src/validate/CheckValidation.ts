import { NextFunction, Request, Response } from "express";
import {
  FieldValidationError,
  Result,
  ValidationError,
  validationResult,
} from "express-validator";
import AppError from "../utils/appError";

export function CheckValidationSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let result: any = {};
    const errors: ValidationError[] & any = validationResult(req);
    if (errors.isEmpty()) return next();
    const errorMessages = errors.array().map((err: ValidationError) => {
      return `${err.msg}`;
    });
    return next(new AppError(errorMessages.join(", "), 400));
    /* 
    for (const err of errors.array()) {
      const item: ValidationError&any = err;
      const key = item.param;
      const isIncluded = Object.prototype.hasOwnProperty.call(result, key);
      if (isIncluded) continue;
      result[item.param] = item.msg;
    } */
    throw new AppError(errors, 400);
  } catch (error) {
    next(error);
  }
}
