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
const Request_1 = __importDefault(require("../../features/Request"));
function fetchCategoryName(_a) {
    return __awaiter(this, arguments, void 0, function* ({ category_id, original_product_id, metadata_title, tokenInfo, }) {
        console.log(category_id, original_product_id, metadata_title);
        /*    const product = await Product.findOne({
            original_product_id,
          }); */
        /*     if (!product) {
            console.log("No product found with the given criteria");
            return;
          } */
        /* console.log(product); */
        let data = (0, Request_1.default)({
            categoryId: category_id,
            language: "en",
            method: "aliexpress.ds.category.get",
            sign_method: "sha256",
        }, tokenInfo)
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            /*      console.log(
                response.data.aliexpress_ds_category_get_response.result.categories[0]
                  .category_name
              ); */
            /*  console.log(
                response.data.aliexpress_ds_category_get_response.resp_result
                  .categories.category[0].category_name
              ); */
            let category_name = response.data.aliexpress_ds_category_get_response.resp_result.result
                .categories.category[0].category_name;
            console.log(category_name);
            return category_name;
        }))
            .catch((err) => {
            console.log(err);
            return "null";
        });
        return data;
    });
}
exports.default = fetchCategoryName;
