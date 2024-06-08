import axios, { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { pick, uniqBy } from "lodash";
import AppError from "../../../../utils/appError";
import User from "../../../../models/user.model";
import {
  OptionType,
  Product,
  ProductDocument,
  ProductSchema,
  ValueType,
} from "../../../../models/product.model";
import SallaToken from "../../../../models/SallaTokenModel";
import MakeRequest from "../../features/Request";
import AliExpressToken from "../../../../models/AliExpressTokenModel";
import {
  UpdateProductVariant,
  UpdateProductVariantSale,
  getProductSkus,
  getProductVariants,
} from "./CRUD";
import { RefreshTokenHandler } from "../../../salla/RefreshAccessToken";
import { ProductSallaChecker } from "./features/AlreadyLinkedProduct";
import VariantsPatcher from "./features/VariantsPatcher";
import fs from 'fs';
import { CheckSubscription } from "../../../../utils/handlers/CheckSubscription";
import { WebSocketSender } from "../../../../utils/handlers/WebSocketSender";
import { Subscription } from "../../../../models/Subscription.model";

export const updateVariantFinalOption2 = async (
  product: ProductDocument,
  token: string,
  tokenData: any
) => {
  const data = await getProductVariants(product.salla_product_id, 1, token);
  console.log(data?.pagination?.totalPages);

  let { totalPages, perPage, currentPage } = data?.pagination;
  let beginIndex = 0;
  if (currentPage == 1) {
    beginIndex = 0;
  } else {
    beginIndex = currentPage * perPage;
  }
  const errorArray = await VariantsPatcher({
    product,
    totalPages,
    beginIndex,
    perPage,
    token,
    variantsResponse: data,
    currentPage,
  });
  console.log("errorArray", errorArray);
  console.log("totalPages", totalPages);
  if (totalPages == 1) {
    return;
  }

  // let { totalPages, perPage, currentPage } = data?.pagination;
  let currentIndex = perPage;
  beginIndex = perPage;

  for (let i = 2; i <= totalPages; i++) {
    console.log("MULTIPLE PAGES", i);

    const dataPage2 = await getProductVariants(
      product.salla_product_id,
      i,
      token
    );
    currentPage = dataPage2.pagination.currentPage;
    const errorArray = await VariantsPatcher({
      product,
      totalPages,
      beginIndex,
      perPage,
      token,
      variantsResponse: dataPage2,
      currentPage,
    });
    console.log("errorArray", errorArray);
  }
  return;
 
};

export const updateVariantFinalOptionOld = async (
  product: ProductDocument,
  token: string,
  tokenData: any
) => {
  const jsonProduct = product.toJSON();
  const data = await getProductVariants(product.salla_product_id, 1, token);
  console.log(data?.pagination?.totalPages);

    const variants = data?.data?.filter((e: any) => !e.sku);
if(!variants){

  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
  console.log("No variants")
}
    let variantsIds = variants.map((el: any) => {
      return el.id;
    });
    console.log("variantsIds", variantsIds);
    console.log("variantsIds.length", variantsIds.length);
    console.log("variantsIds.length", variantsIds.length);
    console.log("variantsIds.length", variantsIds.length);
    console.log("variantsIds.length", variantsIds.length);

    let { variantsArr, showDiscountPrice } = product;
    console.log("variantsArr",variantsArr)
    let promises = variantsArr.map((el: any, index: number) => {
      let variantId = variantsIds[index];
      let {
        offer_sale_price: priceString,
        sku_available_stock: quantity,
        sku_id,
        sku_price: oldPrice,shippingChoice,commission,profitTypeValue
      } = el satisfies {commission:number};

      let price = parseFloat(priceString)
      console.log("quantity", quantity);
   if(commission!=0 && commission>0){
    if (profitTypeValue=="number") {
      price = (price) + commission;
    } else if (profitTypeValue=="percentage") {
      price =
        (commission / 100) * (price) +
        (price);
    }
   }else{

     if (product?.vendor_commission && !product?.commissionPercentage) {
       price = (price) + product?.vendor_commission;
     } else if (product?.vendor_commission && product?.commissionPercentage) {
       price =
         (product?.vendor_commission / 100) * (price) +
         (price);
     }
   }

  // console.log("product?.options",product?.options)
      if (
        //@ts-ignore
        product?.shipping?.length!=0 && shippingChoice =="shippingIncluded"
      ) {
        let shippingIncludedChoiceIndex =  0 ;
if(product?.shippingIncludedChoice){
  shippingIncludedChoiceIndex = product?.shippingIncludedChoiceIndex || 0; 
}
        //@ts-ignore
       console.log("product?.shippingIncludedChoice",product?.shippingIncludedChoice)
       console.log("product?.shippingIncludedChoiceIndex",product?.shippingIncludedChoiceIndex)
        let extraShippingCost =
          //@ts-ignore
          product?.shipping?.[shippingIncludedChoiceIndex]?.freight?.cent / 100;
        console.log("extraShippingCost", extraShippingCost);
        price += extraShippingCost;
        console.log("price", price);
      }
      let mnp = getRandomInt(100000000000000, 999999999999999);
      let gitin = getRandomInt(10000000000000, 99999999999999);
      let barcode = [mnp, gitin].join("");
      // add condition for sale enabling in product
      if (oldPrice && showDiscountPrice) {
        return UpdateProductVariantSale(
          variantId,
          barcode,
          oldPrice,
          quantity,
          mnp,
          gitin,
          sku_id,
          token,
          price
        );
      }
      return UpdateProductVariant(
        variantId,
        barcode,
        price,
        quantity,
        mnp,
        gitin,
        sku_id,
        token
      );
    });

    let results = await Promise.all(promises);
console.log("results.length",results.length)

let errorArrayVariants :any= []
    results.forEach((result) => {
      
      if(!result){
        errorArrayVariants.push(result)
        console.log("A VARIANT IS UNDEFINED")
      }
      console.log(result?.data);
    });
    console.log("errorArrayVariants",errorArrayVariants)
    return;
  
};
function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
export async function LinkProductSalla2(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("reached this 1 ");
    
    const { role, _id } = req.user;
    let subscription = await CheckSubscription(
       _id.toString(),
       "products_limit"
     );
    let { productId } = req.body;
    let product: ProductDocument | undefined | null = await Product.findById(
      productId
    );
    if (!product)
      return res
        .status(404)
        .json({ message: "Cannot find product with the given id" });
    const sallaTokenDocument = await SallaToken.findOne({
      _id: req.user.sallaToken,
    });

    if (!req.user.sallaToken || !sallaTokenDocument) {
      return res.status(404).json({ message: "SallaToken Not Found." });
    }

    const aliexpressDoc = await AliExpressToken.findOne({
      _id: req.user.aliExpressToken,
    });
    let { accessToken } = sallaTokenDocument!;
    let token = accessToken;
    let access_token = accessToken;
    let tokenData = {
      aliExpressAccessToken: aliexpressDoc?.accessToken,
      aliExpressRefreshToken: aliexpressDoc?.refreshToken,
    };

    const jsonProduct = product?.toJSON();
    /*  if (userType === "admin") {
      account = await User.findOne({
        _id: merchant,
        userType: "vendor",
      }).exec();
    }  */
    console.log("reached this 2 ");
    let noOptionsInProduct = false;
    let prodPrice = parseFloat(product.variantsArr[0].offer_sale_price);
    let totalPrice: number =
      (product?.vendor_commission / 100) * prodPrice + prodPrice;
    /*    console.log("product.commissionPercentage", product.commissionPercentage);
    console.log("product?.vendor_commission", product?.vendor_commission); */
    if (!product.commissionPercentage) {
      totalPrice = product?.vendor_commission + prodPrice;
    }
    if (
      //@ts-ignore
      product?.shipping?.length != 0 &&
      product.shippingIncludedChoice &&
      product.shippingIncludedChoiceIndex !== -1
    ) {
      console.log(
        "product.shippingIncludedChoice",
        product.shippingIncludedChoice
      );
      console.log(
        "product.shippingIncludedChoiceIndex",
        product.shippingIncludedChoiceIndex
      );
      //@ts-ignore
      totalPrice +=
        //@ts-ignore
        product?.shipping?.[product.shippingIncludedChoiceIndex].freight.cent /
        100;
    }
    let bodyDataSalla: any = {
      name: req.query.name || product.name,
      price: totalPrice,
      product_type: product.product_type,
      quantity: product?.quantity,
      description: product.description,
      cost_price: product.main_price,
      require_shipping: product.require_shipping,
      sku: product.sku,
      images: product.images,
      // options: product.options,
      metadata_title: product?.metadata_title,
      metadata_description: product?.metadata_description,
    };
    if (product.sallaTags) {
      let prodTags = product.sallaTags
        .filter((t: any) => t)
        .map((tag: { id: number; name: string }) => tag.id);
      bodyDataSalla.tags = prodTags;
      console.log("prodTags", prodTags);
    }

    //@ts-ignore
    if (product?.options?.[0]?.name) {
      bodyDataSalla.options = product.options;
    }
    if (product?.categoriesSalla) {
      bodyDataSalla.categories = product?.categoriesSalla;
    }

    if (product?.showDiscountPrice) {
      let originalPrice = parseFloat(product.variantsArr[0].sku_price);
      if(product?.discountPrice &&product?.discountPrice >0 && typeof Number(product?.discountPrice)=="number"){
        originalPrice=Number(product?.discountPrice)
      }
      bodyDataSalla.price = originalPrice;
      bodyDataSalla.sale_price = totalPrice;
    }
    //@ts-ignore

    if (!product?.options?.[0]?.name) {
      noOptionsInProduct = true;
    }

    const options_1 = {
      method: "POST",
      url: "https://api.salla.dev/admin/v2/products",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: bodyDataSalla,
    };

    console.log("here");

    let createdeProduct = await ProductSallaChecker(
      options_1,
      product?.sku,
      token,
      req,
      res,
      next,
      product
    );
    if (createdeProduct?.message == "Cancel") {
      return;
    } else if (createdeProduct?.message == "Error") {
      throw new AppError("sku already linked to a product on Salla", 400);
    }
    console.log("createdeProduct?.status", createdeProduct?.status);
    if (!createdeProduct || !createdeProduct?.data) {
      try {
        createdeProduct = await axios.request(options_1);
      } catch (error) {
        console.error(error);
      }
    }

    const opt = {
      method: "GET",
      url: `https://api.salla.dev/admin/v2/products/${createdeProduct.data.id}`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    console.log("here");

    const { data: productResult } = await axios.request(opt);
    console.log(createdeProduct.data.id);
fs.writeFile("productResult.json",JSON.stringify({productResult},null,2),(err)=>{
  console.error(err)
})

    if (
      !noOptionsInProduct
    ) {
      // fs.appendFile("info.json","executed if statement",(err)=>{console.error(err)})
      console.log("executed if statement")
      product.options = await Promise.all(
        jsonProduct?.options?.map(async (option: OptionType, index: number) => {
          let obj: OptionType = option;
          const productOption = productResult?.data?.options?.[index];
          const values = await Promise.all(
            option?.values?.map(async (value: ValueType, idx: number) => {
              const optionValue = productOption?.values?.[idx];
              console.log(optionValue);
              const mnp = getRandomInt(100000000000000, 999999999999999);
              const gitin = getRandomInt(10000000000000, 99999999999999);
              return {
                ...value,
                mpn: mnp,
                gtin: gitin,
                salla_value_id: optionValue?.id,
              };
            })
          );

          obj.salla_option_id = productOption?.id;
          obj.values = values;
          //this is new
          return obj;
        })
      );

      const finalOptions = await Promise.all(
        jsonProduct?.options?.map(async (option: OptionType, idx: number) => {
          const values = await Promise.all(
            option?.values?.map(async (optionValue: any, i: number) => {
              return optionValue;
            })
          );
          return {
            ...option,
            values,
          };
        })
      );

      product.options = finalOptions;
let sallaValuesIds =  finalOptions.map((option: any) => {
  let {salla_option_id,values} = option;
  values = values.map((value: any) => {
    let {sku,salla_value_id} = value;
    return {sku,salla_value_id}
  })
  return{values,salla_option_id}
})
      // update variants with salla_value_id
const variantsArr =   jsonProduct?.variantsArr?.map((variant: any) => {
  let {sku_code} = variant
let sku_code_split = sku_code.split(";")
let sallaValues = []
for(let i =0 ; i<sallaValuesIds.length;i++){
  let salla_value_id = sallaValuesIds[i].values.find((value: any) => sku_code_split.includes(value.sku) )?.salla_value_id
   sallaValues.push(salla_value_id)
}
  return {...variant , sallaValues}
});


      // 
      product.variantsArr = variantsArr
      // fs.appendFile("info.json",JSON.stringify({finalOptions},null,2),(err)=>{console.error(err)})
      // fs.appendFile("variantsArr.json",JSON.stringify({variantsArr},null,2),(err)=>{console.error(err)})
    }
    product.salla_product_id = productResult.data?.id;
    await product.save();
    if (noOptionsInProduct) {
      await Promise.all([product.save()]);
      return res.status(200).json({
        message: "Product created successfully",
        result: {
          urls: productResult.data.urls || {},
        },
      });
    }
    (async () =>
      await updateVariantFinalOption2(product, access_token, tokenData))().then(
      async () => {
        if (subscription && subscription.products_limit) {
           subscription = await Subscription.findOneAndUpdate(
            { _id: subscription._id },
            { $inc: { products_limit: -1 } },
            { new: true }
          );
        }
/*         await Promise.all([product?.save(), subscription?.save()]);
        if(subscription)
        WebSocketSender(subscription); */
        await product?.save();
        subscription?.save().then(updatedSubscription => {
          if(updatedSubscription)
            WebSocketSender(updatedSubscription);
        }).catch(err => {
          // handle error
          console.error(err);
        });
        // await Promise.all([product?.save()]);
        return res.status(200).json({
          message: "Product created successfully",
          result: {
            urls: productResult.data.urls || {},
          },
        });
      }
    );
  } catch (error: AxiosError | any) {
    const isAxiosError = error instanceof AxiosError;

    const values = error?.response?.data;
    console.log(error?.response?.data);
    console.log(error);
    console.log(error?.response?.data?.error?.fields?.sku);
    console.log(error?.response?.data?.error?.fields?.price);
    console.log(
      error?.response?.data?.error?.fields?.visibility_condition_type
    );
    console.log(
      error?.response?.data?.error?.fields?.visibility_condition_option
    );
    console.log(
      error?.response?.data?.error?.fields?.visibility_condition_value
    );
    console.log(error?.response?.data?.error?.fields?.["options.0.name"]);
    console.log(
      error?.response?.data?.error?.fields?.["options.0.values.0.name"]
    );
    console.log(error?.response?.data?.error?.fields?.metadata_title);
    next(isAxiosError ? new AppError(values, 400) : error);
  }
}
