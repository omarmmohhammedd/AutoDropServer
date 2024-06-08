import { NextFunction, Request, Response } from "express";
import {
  Product,
  ProductDocument,
  ProductSchema,
} from "../../../../models/product.model";
import catchAsync from "../../../../utils/catchAsync";
import { IUserSchema } from "../../../../models/user.model";

const GetProductInfo = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    let { productId } = req.params;
    const product:
      | (ProductDocument & {
          merchant: {
            setting: {
              highestPriceUnion: boolean;
            };
            _id:string
          };
        })
      | null = await Product.findById(productId).select("highestOptionValue country_code shippingIncludedChoiceIndex shippingIncludedChoice sallaTags categoriesSalla discountPrice showDiscountPrice commissionPercentage variantsArr shipping merchant salla_product_id metadata_description metadata_title options images sku quantity vendor_commission name description sku_id price target_sale_price target_original_price original_product_id").populate({
      path: "merchant",
      select:"setting",
      populate: {
        path: "setting",
        select: "highestPriceUnion originalPriceShipping",
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let productJSON = product.toJSON();
    const highestPriceUnionEnabled = product.merchant.setting?.highestPriceUnion;
    if (highestPriceUnionEnabled && product?.highestOptionValue !== 0) {
      productJSON.variantsArr = productJSON.variantsArr.map((variant: any) => {
        return {
          ...variant,
          offer_sale_price: product.highestOptionValue,
          old_offer_sale_price: variant.offer_sale_price,
        };
      });
      productJSON.target_sale_price = product.highestOptionValue
    }
    if(productJSON.merchant.setting?.originalPriceShipping === "shippingIncluded"){
      productJSON.shippingIncludedChoice = true;
    }else{
      productJSON.shippingIncludedChoice = false;
    }
    console.log(product.merchant);
    console.log("product",product)
    console.log("product.highestOptionValue", product?.highestOptionValue);  
    if (product.merchant._id.toString() !== ((req.user?._id).toString() as string)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this product" });
    }

    return res.status(200).json({ product:productJSON });
  }
);
export default GetProductInfo;
