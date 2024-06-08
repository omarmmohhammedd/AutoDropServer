import { schedule } from "node-cron";
import {
  OptionType,
  Product,
  ProductDocument,
  ProductSchema,
} from "../../models/product.model";
import User, { IUserSchema } from "../../models/user.model";
import axios from "axios";
import { GetDetails } from "../../controllers/aliexpress/GetProducts.controller";
import AliExpressToken from "../../models/AliExpressTokenModel";
import { ISetting } from "../../models/Setting.model";
import { createAccessToken } from "../../utils/authHelperFunction";
import fs from "fs";
import { IsVariantsDifferent } from "./handlers/VariantsChecker";

const time: string = "0 */12 * * *";


const ProductUpToDate = schedule(time, async function () {
  try {
    console.log(
      "cron job started to update products when original product price updated"
    );

    let paginateOptions = {
      page: 1,
      limit: 10,
    };
    let results;
    let products: ProductDocument[] | null;
    do {
      results = await Product.paginate({}, paginateOptions);
      products = results.docs;
      //  if (!products || !products?.length) return;
      let productsRes = await Promise.allSettled(
        products.map(async (product: ProductDocument) => {
          if (!product) return;
          const user: (IUserSchema & { setting: ISetting }) | null =
            await User.findById(product.merchant).populate(
              "setting",
              "syncProdPrices syncProdQuantities"
            );
          if (!user) return;
          let token = await createAccessToken(user.id);

          let productJSON = product.toJSON();
          let aliexpressToken = await AliExpressToken.findOne({
            userId: user?._id,
          });
          let tokenInfo = {
            aliExpressAccessToken: aliexpressToken?.accessToken,
            aliExpressRefreshToken: aliexpressToken?.refreshToken,
          };
          const findProduct = await GetDetails({
            product_id: product.original_product_id as string,
            tokenInfo,
            lang: "EN",
          });

          let syncQuantities = user.setting.syncProdQuantities;
          let syncProd = user.setting.syncProdPrices;

   
          if (
            (syncQuantities || syncProd) &&
            IsVariantsDifferent(product, findProduct)
          ) {
            let { price, main_price, variantsArr, quantity, options } =
              findProduct;
            product.price = price;
            product.main_price = main_price;
            product.options = options;
            let commissionPopulatedNewVariants = variantsArr;
            if (variantsArr?.length == product.variantsArr?.length) {
              for (let i = 0; i < product?.variantsArr?.length; i++) {
                let { profitTypeValue, commission } = product?.variantsArr?.[i];
                commissionPopulatedNewVariants[i] = {
                  ...commissionPopulatedNewVariants?.[i],
                  profitTypeValue,
                  commission,
                };
              }
            }
            product.variantsArr = commissionPopulatedNewVariants;
            product.quantity = quantity;
            await product.save();

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
              const res = await axios.request(options);
              fs.appendFile(
                "cronProductUpdate.json",
                JSON.stringify({ res }, null, 2),
                () => {}
              );
            }
          }
        })
      );
      await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));

      paginateOptions.page++;
    } while (results.hasNextPage);
  } catch (error) {
    console.log("Error while getting products details and update..");
    console.log(error);
  }
});

export default ProductUpToDate;
