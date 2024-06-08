"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSallaToken = exports.deleteAliExpressToken = void 0;
const AliExpressTokenModel_1 = __importDefault(require("../models/AliExpressTokenModel"));
const user_model_1 = __importDefault(require("../models/user.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const SallaTokenModel_1 = __importDefault(require("../models/SallaTokenModel"));
exports.deleteAliExpressToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(id);
    // Delete the AliExpressToken document
    yield AliExpressTokenModel_1.default.findByIdAndDelete(id);
    // Remove the reference from the User document
    yield user_model_1.default.updateOne({ aliExpressToken: id }, { $unset: { aliExpressToken: "" } });
    res.status(200).json({ message: "AliExpressToken deleted successfully" });
}));
exports.deleteSallaToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Delete the AliExpressToken document
    yield SallaTokenModel_1.default.findByIdAndDelete(id);
    // Remove the reference from the User document
    yield user_model_1.default.updateOne({ sallaToken: id }, { $unset: { sallaToken: "", merchantID: "", storeName: '', storeLink: '' } });
    res.status(200).json({ message: "AliExpressToken deleted successfully" });
}));
