import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../utils/catchAsync";
import {
  Product,
  ProductDocument,
  ProductSchema,
} from "../../../../models/product.model";
import axios from "axios";
import SallaToken from "../../../../models/SallaTokenModel";
import { Types } from "mongoose";
interface ProductDocumentParameter extends ProductDocument {
  _id: Types.ObjectId; // Make _id required
  // ... other properties ...
}
const handleProductProperties = async (
  product: ProductDocumentParameter & {},
  reqBody: any
) => {
  let {
    name,
    description,
    commissionPercentage,
    showDiscountPrice,
    vendor_commission,
    productQuantity,
    metadata_description,
    metadata_title,
    categoriesSalla,
    require_shipping,
    selectedTags,

    shippingIncludedChoice,
    shippingIncludedChoiceIndex,
    variantsArr,
    options,
    images,
    discountPrice,
    shipping,
    country_code,
    ...body
  } = reqBody;
  if (options) {
    product.options = options;
  }
  if (images) {
    product.images = images;
  }
  if (shipping) {
    product.shipping = shipping;
  }
  if (country_code) {
    product.country_code = country_code;
  }
  if (discountPrice !== undefined) {
    product.discountPrice = discountPrice;
  }
  if (variantsArr) {
    product.variantsArr = variantsArr;

    let totalQ = 0;
    variantsArr.forEach((variant: any) => {
      totalQ += Number(variant.sku_available_stock);
    });
    product.quantity = totalQ;
  }

  if (shippingIncludedChoice && shippingIncludedChoiceIndex) {
    product.shippingIncludedChoice = shippingIncludedChoice;
    product.shippingIncludedChoiceIndex = shippingIncludedChoiceIndex;
  }
  if (metadata_description) {
    product.metadata_description = metadata_description;
  }
  if (description) {
    product.description = description;
  }
  if (metadata_title) {
    product.metadata_title = metadata_title;
  }
  if (name) {
    product.name = name;
  }
  product.commissionPercentage = commissionPercentage;
  if (showDiscountPrice) {
    product.showDiscountPrice = showDiscountPrice;
  }
  product.vendor_commission = vendor_commission;
  product.commissionPercentage = commissionPercentage;
  if (categoriesSalla) {
    product.categoriesSalla = categoriesSalla;
  }

  if (require_shipping) {
    product.require_shipping = require_shipping;
  }
  return product;
};
const tagsSallaHandler = async (
  sallaAccessToken: string,
  selectedTags: string[]
) => {
  console.log("selectedTags", selectedTags);
  const promises = selectedTags.map((tag: string) => {
    const sallaOpt = {
      url: `https://api.salla.dev/admin/v2/products/tags?tag_name=${tag}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ` + sallaAccessToken,
        "Content-Type": "application/json",
      },
    };
    return axios.request(sallaOpt);
  });
  let promisesSettled = await Promise.allSettled(promises);
  let tagsSalla = promisesSettled.map((promise: any) => {
    if (promise.status === "rejected") {
      console.log(promise.reason);
      console.log(promise);
      return null;
    }
    console.log(promise);
    // [{id,name}]
    return promise.value.data.data;
  });
  console.log("tagsSalla", tagsSalla);
  return tagsSalla;
};
const PatchProduct = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    if (!req.params) {
      return res
        .status(400)
        .json({ message: "Missing productId in query parameters." });
    }
    console.log("reached Patch 1 ");
    //@ts-ignore
    let { productId }: { productId: string } = req.params;

    let sallaToken = await SallaToken.findById(req.user?.sallaToken);
    if (!sallaToken) {
      return res.status(404).json({ message: "SallaToken Not Found." });
    }
    let { accessToken: sallaAccessToken } = sallaToken;
    let product = await Product.findOne({
      //@ts-ignore
      merchant: req.user._id as any,
      _id: productId,
    });

    if (!product) {
      console.log("No product found");
      return res.status(404).json({ message: "Product Not Found." });
    }
    // product = await handleProductProperties(product,req.body)
    let {
      name,
      description,
      commissionPercentage,
      showDiscountPrice,
      vendor_commission,
      productQuantity,
      metadata_description,
      metadata_title,
      categoriesSalla,
      require_shipping,
      selectedTags,

      shippingIncludedChoice,
      shippingIncludedChoiceIndex,
      variantsArr,
      options,
      images,
      discountPrice,
      shipping,
      country_code,
      ...body
    } = req.body;
    let sallaTags;
    // product = await handleProductProperties(product,req.body)
    if (options) {
      product.options = options;
    }
    if (images) {
      product.images = images;
    }
    if (shipping) {
      product.shipping = shipping;
    }
    if (country_code) {
      product.country_code = country_code;
    }
    if (discountPrice !== undefined) {
      product.discountPrice = discountPrice;
    }
    if (variantsArr) {
      product.variantsArr = variantsArr;

      let totalQ = 0;
      variantsArr.forEach((variant: any) => {
        totalQ += Number(variant.sku_available_stock);
      });
      product.quantity = totalQ;
    }

    if (selectedTags && selectedTags.length > 0) {
      sallaTags = await tagsSallaHandler(sallaAccessToken, selectedTags);
    }

    if (shippingIncludedChoice && shippingIncludedChoiceIndex) {
      product.shippingIncludedChoice = shippingIncludedChoice;
      product.shippingIncludedChoiceIndex = shippingIncludedChoiceIndex;
    }

    // console.log("reached Patch 2 ");

    if (sallaTags && sallaTags.length > 0) {
      product.sallaTags = sallaTags;
    }
    if (product?.salla_product_id) {
      let axiosOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers["authorization"],
        },
        url: `  ${process.env.Backend_Link}salla/deleteProduct/${product.salla_product_id}`,
      };
      let { data: deleteResp } = await axios.request(axiosOptions);

      if (deleteResp.status !== "success") {
        return res.status(400).json({
          status: "failed",
        });
      }
      product.salla_product_id = undefined;
    }
    if (metadata_description) {
      product.metadata_description = metadata_description;
    }
    if (description) {
      product.description = description;
    }
    if (metadata_title) {
      product.metadata_title = metadata_title;
    }
    if (name) {
      product.name = name;
    }
    if (commissionPercentage) {
      product.commissionPercentage = commissionPercentage;
    }
    if (typeof showDiscountPrice == "boolean") {
      product.showDiscountPrice = showDiscountPrice;
    }
    product.vendor_commission = vendor_commission;
    product.commissionPercentage = commissionPercentage;
    if (categoriesSalla) {
      product.categoriesSalla = categoriesSalla;
    }

    if (require_shipping) {
      product.require_shipping = require_shipping;
    }
    console.log("before save");
    try {
      await product.save();
    } catch (err) {
      console.error(err);
    }
    console.log("after save");

    const opt2 = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers["authorization"],
      },
      url: `${process.env.Backend_Link}aliexpress/product/linkProductSalla/v2`,
      data: {
        productId: product._id,
      },
    };
    let { data: response } = await axios.request(opt2);

    if (response.status === "failed") {
      return res.status(400).json({
        status: "failed",
      });
    }

    return res.json({ message: "Product Patched Successfully" });
  }
);
export default PatchProduct;
