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
const node_cron_1 = require("node-cron");
const product_model_1 = require("../../models/product.model");
const user_model_1 = __importDefault(require("../../models/user.model"));
const axios_1 = __importDefault(require("axios"));
const GetProducts_controller_1 = require("../../controllers/aliexpress/GetProducts.controller");
const AliExpressTokenModel_1 = __importDefault(require("../../models/AliExpressTokenModel"));
const authHelperFunction_1 = require("../../utils/authHelperFunction");
const fs_1 = __importDefault(require("fs"));
const VariantsChecker_1 = require("./handlers/VariantsChecker");
const time = "0 */12 * * *";
const ProductUpToDate = (0, node_cron_1.schedule)(time, function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("cron job started to update products when original product price updated");
            let paginateOptions = {
                page: 1,
                limit: 10,
            };
            let results;
            let products;
            do {
                results = yield product_model_1.Product.paginate({}, paginateOptions);
                products = results.docs;
                //  if (!products || !products?.length) return;
                let productsRes = yield Promise.allSettled(products.map((product) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    if (!product)
                        return;
                    const user = yield user_model_1.default.findById(product.merchant).populate("setting", "syncProdPrices syncProdQuantities");
                    if (!user)
                        return;
                    let token = yield (0, authHelperFunction_1.createAccessToken)(user.id);
                    let productJSON = product.toJSON();
                    let aliexpressToken = yield AliExpressTokenModel_1.default.findOne({
                        userId: user === null || user === void 0 ? void 0 : user._id,
                    });
                    let tokenInfo = {
                        aliExpressAccessToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.accessToken,
                        aliExpressRefreshToken: aliexpressToken === null || aliexpressToken === void 0 ? void 0 : aliexpressToken.refreshToken,
                    };
                    const findProduct = yield (0, GetProducts_controller_1.GetDetails)({
                        product_id: product.original_product_id,
                        tokenInfo,
                        lang: "EN",
                    });
                    let syncQuantities = user.setting.syncProdQuantities;
                    let syncProd = user.setting.syncProdPrices;
                    if ((syncQuantities || syncProd) &&
                        (0, VariantsChecker_1.IsVariantsDifferent)(product, findProduct)) {
                        let { price, main_price, variantsArr, quantity, options } = findProduct;
                        product.price = price;
                        product.main_price = main_price;
                        product.options = options;
                        let commissionPopulatedNewVariants = variantsArr;
                        if ((variantsArr === null || variantsArr === void 0 ? void 0 : variantsArr.length) == ((_a = product.variantsArr) === null || _a === void 0 ? void 0 : _a.length)) {
                            for (let i = 0; i < ((_b = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _b === void 0 ? void 0 : _b.length); i++) {
                                let { profitTypeValue, commission } = (_c = product === null || product === void 0 ? void 0 : product.variantsArr) === null || _c === void 0 ? void 0 : _c[i];
                                commissionPopulatedNewVariants[i] = Object.assign(Object.assign({}, commissionPopulatedNewVariants === null || commissionPopulatedNewVariants === void 0 ? void 0 : commissionPopulatedNewVariants[i]), { profitTypeValue,
                                    commission });
                            }
                        }
                        product.variantsArr = commissionPopulatedNewVariants;
                        product.quantity = quantity;
                        yield product.save();
                        if (product.salla_product_id) {
                            // unlink from salla and re link
                            let options = {
                                url: `${process.env.Backend_Link}aliexpress/product/updateProduct/${product.id}`,
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer " + token,
                                },
                            };
                            const res = yield axios_1.default.request(options);
                            fs_1.default.appendFile("cronProductUpdate.json", JSON.stringify({ res }, null, 2), () => { });
                        }
                    }
                })));
                yield new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
                paginateOptions.page++;
            } while (results.hasNextPage);
        }
        catch (error) {
            console.log("Error while getting products details and update..");
            console.log(error);
        }
    });
});
exports.default = ProductUpToDate;
