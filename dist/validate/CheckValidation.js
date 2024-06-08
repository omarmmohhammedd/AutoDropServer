"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckValidationSchema = void 0;
const express_validator_1 = require("express-validator");
const appError_1 = __importDefault(require("../utils/appError"));
function CheckValidationSchema(req, res, next) {
    try {
        let result = {};
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty())
            return next();
        const errorMessages = errors.array().map((err) => {
            return `${err.msg}`;
        });
        return next(new appError_1.default(errorMessages.join(", "), 400));
        /*
        for (const err of errors.array()) {
          const item: ValidationError&any = err;
          const key = item.param;
          const isIncluded = Object.prototype.hasOwnProperty.call(result, key);
          if (isIncluded) continue;
          result[item.param] = item.msg;
        } */
        throw new appError_1.default(errors, 400);
    }
    catch (error) {
        next(error);
    }
}
exports.CheckValidationSchema = CheckValidationSchema;
