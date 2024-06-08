import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import MakeRequest from "./features/Request";
import TokenUserExtractor from "../../utils/handlers/tokenUserExtractor";
import AliExpressToken from "../../models/AliExpressTokenModel";
import {
  getNewProductShippingServices,
  getProductShippingServices,
} from "./features/shipping";
import { basename, extname } from "path";
import { pick, map, uniqBy, filter, uniq } from "lodash";
import slugify from "slugify";
import { ImageType, Product, ProductSchema } from "../../models/product.model";
import { v4 as uuid } from "uuid";
import fetchCategoryName from "./products/Category/FetchNameOfCategory";
import catchAsync from "../../utils/catchAsync";
import fs from "fs";

function generateRandomNumber(start: any, end: any) {
  // Generate a random decimal between 0 and 1
  var randomDecimal = Math.random();

  // Scale the random decimal to the desired range
  var randomInRange = randomDecimal * (end - start + 1);

  // Shift the range to start from the desired start number
  var randomInteger = Math.floor(randomInRange) + start;

  return randomInteger;
}
export async function GetRecommendedProducts(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  // console.log(req.query);
  let user: any = await TokenUserExtractor(req);
  if (!user) return res.status(401).json({ message: "token is invalid" });

  let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
  const { lang } = req.query;
  let result: any = [];
  let response = await MakeRequest(
    {
      method: "aliexpress.ds.feedname.get",
      sign_method: "sha256",
    },
    {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    }
  );
  let respData = response;
  // console.log(
  //   respData.data.aliexpress_ds_feedname_get_response?.resp_result.result.promos
  //     .promo[3]
  // );
  while (result.length < 10) {
    const randomPage = generateRandomNumber(
      0,
      respData.data.aliexpress_ds_feedname_get_response?.resp_result.result
        .promos.promo.length - 1
    );
    const randomFeedName =
      respData.data.aliexpress_ds_feedname_get_response.resp_result.result
        .promos.promo[randomPage].promo_name;
    // console.log(randomFeedName);
    let response2 = await MakeRequest(
      {
        method: "aliexpress.ds.recommend.feed.get",
        target_currency: "SAR",
        country: "SA",
        // feed_name: randomFeedName,
        feed_name: "DS_Sports&Outdoors_bestsellers",
        target_language: lang,
        page_no: 1,
        page_size: 21,
        sign_method: "sha256",
      },
      {
        aliExpressAccessToken: aliexpressToken?.accessToken,
        aliExpressRefreshToken: aliexpressToken?.refreshToken,
      }
    );
    let resPage = response2;
    const products =
      resPage.data.aliexpress_ds_recommend_feed_get_response.result.products
        .traffic_product_d_t_o;

    if (products) {
      result.push(...products);
      // console.log(result.length);
    }
  }
  // console.log(result.length);

  if (!result.length) throw new AppError("Products Not Found", 409);
  res.json({ result });
}
export async function GetProductByName(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  // console.log(req.query);
  let user: any = await TokenUserExtractor(req);
  if (!user) return res.status(401).json({ message: "token is invalid" });
  let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
  const { lang } = req.query;
  let result: any = [];
  let response = await MakeRequest(
    {
      method: "aliexpress.ds.category.get",
      sign_method: "sha256",
      fields: "all",
      keywords: "shoes",
    },
    {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    }
  );
  let respData = response;
  console.log(respData);
  res.json({ response });
}
export const GetRecommendedProductsPost = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    console.log(req.query);
    let user: any = await TokenUserExtractor(req);
    if (!user  ) return res.status(401).json({ message: "token is invalid" });
    if (!user.aliExpressToken ) return res.status(403).json({ message: "please link your account with aliexpress" });

  
  let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    const { lang } = req.query;
    let result: any = [];
    let response = await MakeRequest(
      {
        method: "aliexpress.ds.feedname.get",
        sign_method: "sha256",
      },
      {
        aliExpressAccessToken: aliexpressToken?.accessToken,
        aliExpressRefreshToken: aliexpressToken?.refreshToken,
      }
    );
    let respData = response;

    while (result.length < 20) {
      const randomPage = generateRandomNumber(
        0,
        respData.data.aliexpress_ds_feedname_get_response?.resp_result.result
          .promos.promo.length - 1
      );
      const randomFeedName =
        respData.data.aliexpress_ds_feedname_get_response?.resp_result.result
          .promos.promo[randomPage].promo_name;
      console.log(randomFeedName);
      let response2 = await MakeRequest(
        {
          method: "aliexpress.ds.recommend.feed.get",
          target_currency: "SAR",
          country: "SA",
          feed_name: randomFeedName,
          // feed_name: "DS_Sports&Outdoors_bestsellers",
          target_language: lang,
          // page_no: req.body.page,
          page_size: 10,
          sign_method: "sha256",
          //
          // category_id: "7",
          //
        },
        {
          aliExpressAccessToken: aliexpressToken?.accessToken,
          aliExpressRefreshToken: aliexpressToken?.refreshToken,
        }
      );
      let resPage = response2;
      const products =
        resPage?.data.aliexpress_ds_recommend_feed_get_response?.result
          ?.products?.traffic_product_d_t_o;

      if (products) {
        result.push(...products);
        console.log(result.length);
      }
    }
    console.log(result.length);

    if (!result.length) throw new AppError("Products Not Found", 409);
    res.json({ result: result.slice(0, 20) });
  }
);
// two methods will be used
async function GetProductOptions(SKUs: object[]) {
  let quantities: number = 0,
    price: number = 0,
    options: any[] = [],
    concatValues: any[] = [],
    collectOptions: any[] = [],
    collectValues: any[] = [];
  collectValues = SKUs.map((sku: any) => {
    return sku?.ae_sku_property_dtos?.ae_sku_property_d_t_o?.map((ev: any) => {
      const {
        sku_image,
        sku_price,
        sku_stock,
        sku_code,
        sku_available_stock,
        offer_sale_price,
        id,
        sku_id,
      } = sku;
      const quantity = sku_available_stock > 100 ? 100 : sku_available_stock;

      quantities += parseFloat(quantity || 0);

      return {
        ...ev,
        sku_id,
        sku_image: ev.sku_image ? ev.sku_image : sku_image,
        sku_price,
        sku_stock,
        sku_code,
        quantity,
        id,
        offer_sale_price,
      };
    });
  });
  concatValues = await Promise.all(new Array().concat(...collectValues));
  collectOptions = uniq(map(concatValues, "sku_property_name"));
  let sku_image_1;
  options = await Promise.all(
    collectOptions
      .map((option: string, index: number) => {
        const uniqValues = uniqBy(
          concatValues
            ?.filter((val) => val?.sku_property_name === option)
            .map((e: any) => ({
              ...e,
              property_value_definition_name:
                e?.property_value_definition_name || e?.sku_property_value,
            })),
          "property_value_id"
          // sku_property_value
          // old property used for filtering
        );

        // console.log(uniqValues)
        const values = uniqValues?.map((val: any, idx: number) => {
          const isFirst = index == 0 && idx == 0;
          const {
            sku_image,
            property_value_definition_name,
            quantity,
            property_value_id,
            sku_property_id,
            id,
            sku_price,
            offer_sale_price,
          } = val;
          const valuePrice = parseFloat(sku_price);
          const offerPrice = parseFloat(offer_sale_price);
          const valPrice = valuePrice === offerPrice ? valuePrice : offerPrice;
          /*    const displayValue = slugify(property_value_definition_name, {
            lower: true,
          }); */
          let displayValue;

          if (property_value_definition_name) {
            displayValue = slugify(property_value_definition_name, {
              lower: true,
            });
          }
          sku_image_1 = sku_image;

          if (isFirst) {
            price = valPrice;
          }

          return {
            name: property_value_definition_name,
            price: valPrice,
            original_price: valPrice,
            quantity: quantity,
            is_default: isFirst,
            property_id: property_value_id,
            sku_id: val.sku_id,
            display_value: displayValue,
            sku: [sku_property_id, property_value_id].join(":"),
            id,
            sku_image,
          };
        });
        return {
          name: option,
          // display_type: sku_image_1 ? "image" : "text",
          display_type: "text",
          values,
        };
      })
      .filter((e) => {
        return e.name !== "Ships From" && e.name != "السفن من";
      })
  );

  return { price, quantities, options };
}
interface SkuImage {
  default: boolean;
  original: string;
  code: string;
}
async function GetProductImages(URLs: string, variantsArr: any) {
  // const splitImages = ae_multimedia_info_dto?.image_urls?.split(";");

  const splitImages = URLs?.split(";");
  let images: ImageType[] = splitImages?.map((obj, index: number) => ({
    original: obj,
    thumbnail: obj,
    alt: "image " + index,
    default: false,
  }));
  // let tempImages = [...images]
  let tempImages = images.slice(0, 1);
  // let strippedImages = tempImages.map((im: any) => im.original);
  let skuImages: SkuImage[] = [];
  let alreadyAddedImages: any = [];
  variantsArr?.forEach((variant: any) => {
    let { relativeOptions: rP ,sku_code} = variant;
    for (let i = 0; i < rP.length; i++) {
      let rPEl = rP[i];
      let { sku_image ,sku_property_name:optionName,property_value_definition_name:valueDefName} = rPEl;
      if (sku_image) {
        // let { sku_code } = rPEl;
        let imageValues = {
          original: sku_image,
          code: sku_code,
          default: false,valueDefName,optionName
        };
      /*   if (strippedImages.includes(sku_image)) {
          tempImages = tempImages.filter((im: any) => {
            return im.original !== sku_image;
          });
        } */

        if (!alreadyAddedImages.includes(sku_image)) {
          skuImages.push(imageValues);
          alreadyAddedImages.push(sku_image);
        }
      }
    }
  });

  let productImages = [];
  if (skuImages?.length + tempImages?.length <= 10) {
    productImages = [...tempImages, ...skuImages];
  } else {
    productImages = [...images];
  }

  fs.appendFile(
    "images.json",
    JSON.stringify(
      { finalImages: productImages, skuImages, images, tempImages },
      null,
      2
    ),
    function (err) {}
  );
  return productImages;
}

export async function GetDetails({
  product_id,
  tokenInfo,
  first_level_category_name,
  second_level_category_name,
  target_sale_price,
  target_original_price,
  lang,
}: {
  product_id: string;
  tokenInfo?: any;
  first_level_category_name?: string;
  second_level_category_name?: string;
  target_sale_price?: string;
  target_original_price?: string;
  lang: "AR" | "EN";
}): Promise<any> {
  return new Promise((resolve, reject) => {
    MakeRequest(
      {
        ship_to_country: "SA",
        product_id: product_id,
        target_currency: "SAR",
        target_language: lang,
        method: "aliexpress.ds.product.get",
        sign_method: "sha256",
      },
      tokenInfo
    )
      .then(async (response) => {
        const aeResponse = response?.data;
        const result = aeResponse?.aliexpress_ds_product_get_response?.result;
        const errorMessage =
          aeResponse?.error_response?.msg ||
          "There is something went wrong while getting product details or maybe this product is not available to shipping to SA, try another product or contact support.";
        // console.log(result);
        if (!result) return resolve(false);
        else {
          const {
            ae_item_sku_info_dtos,
            ae_item_base_info_dto,
            ae_multimedia_info_dto,
          } = result;

          const { subject, product_id, detail }: any =
            ae_item_base_info_dto || {};

          const { ae_item_sku_info_d_t_o: SKUs }: any =
            ae_item_sku_info_dtos || {};
          let variantsArr = SKUs.map((variant: any) => {
            let obj: any = {};
            let {
              offer_sale_price,
              sku_available_stock,
              id,
              sku_code,
              sku_id,
              sku_price,
              offer_bulk_sale_price,
              sku_stock,
            } = variant;
            obj.offer_sale_price = offer_sale_price;
            obj.sku_available_stock = sku_available_stock;
            obj.id = id;
            obj.sku_code = sku_code;
            obj.sku_id = sku_id;
            obj.sku_price = sku_price;
            obj.offer_bulk_sale_price = offer_bulk_sale_price;
            obj.sku_stock = sku_stock;

            let { ae_sku_property_dtos } = variant;

            let relativeOptions: any =
              ae_sku_property_dtos?.ae_sku_property_d_t_o?.map((e: any) => {
                return e;
              });
            obj.relativeOptions = relativeOptions;
            return obj;
          });

          let totalQuantityVariants = 0;
          variantsArr.forEach((variant: any) => {
            let { sku_available_stock: quantity } = variant;
            if (quantity) {
              totalQuantityVariants += quantity;
            }
          });
          if (
            variantsArr?.[0]?.relativeOptions?.some(
              (option: any) =>
                option.sku_property_name === "Ships From" ||
                option.sku_property_name == "السفن من"
            )
          ) {
            // remove 'ships from' variants
            let variantsIdsToKeep: number[] = [];
            let variantsIdentifiers: string[] = [];
            variantsArr.forEach((variant: any, index: number) => {
              let { relativeOptions } = variant;
              relativeOptions = relativeOptions.filter(
                (element: any, index: number) =>
                  element.sku_property_name !== "Ships From" &&
                  element.sku_property_name !== "السفن من"
              );

              let variantIdentifier = relativeOptions
                .map(
                  (element: any, index: number) =>
                    `${element.sku_property_id}:${element.property_value_id}`
                )
                .join("-");
              if (!variantsIdentifiers.includes(variantIdentifier)) {
                variantsIdentifiers.push(variantIdentifier);
                variantsIdsToKeep.push(index);
              }
            });
            // console.log("variantsIdsToKeep", variantsIdsToKeep);
            // console.log("variantsIdsToKeep.length", variantsIdsToKeep.length);
            const newVariantsWithoutShipsFrom = variantsArr
              .filter((variant: any, index: number) => {
                return variantsIdsToKeep.includes(index);
              })
              .map((variant: any) => {
                let { relativeOptions } = variant;
                relativeOptions = relativeOptions.filter((rO: any) => {
                  return (
                    rO.sku_property_name !== "Ships From" &&
                    rO.sku_property_name !== "السفن من"
                  );
                });
                return { ...variant, relativeOptions };
              });
            // console.log(
            //   "newVariantsWithoutShipsFrom",
            //   newVariantsWithoutShipsFrom
            // );
            variantsArr = newVariantsWithoutShipsFrom;
          }
          const [{ price, options }, images] = await Promise.all([
            GetProductOptions(SKUs || []),
            GetProductImages(ae_multimedia_info_dto?.image_urls, variantsArr),
          ]);

          let targetSalePrice =
            Number(variantsArr[0].offer_sale_price) || target_sale_price;
          let targetOriginalPrice =
            Number(variantsArr[0].sku_price) || target_original_price;

          const data: ProductSchema = {
            name: subject,
            description: detail,
            price: price,
            main_price: price,
            quantity: totalQuantityVariants,
            sku: uuid(),
            images: images
              ?.slice(0, 10)
              ?.map((img: ImageType | SkuImage, index: number) => ({
                ...img,
                default: index === 0,
              })),
            options: options,
            metadata_title: subject.substring(0, 70),
            metadata_description: subject,
            product_type: "product",
            original_product_id: product_id,
            merchant: "",
            salla_product_id: "",
            vendor_commission: 0,
            vendor_price: 0,
            require_shipping: true,
            shipping: { name: "default", price: 0 },
            sku_id: SKUs[0].sku_id,
            vat: false,
            // category_id: ae_item_base_info_dto.category_id,
            first_level_category_name,
            second_level_category_name,
            target_sale_price: targetSalePrice,
            target_original_price: targetOriginalPrice,
            variantsArr,
          };

          const product = new Product(data).toJSON();
          resolve(product);
        }
      })
      .catch((error: AppError | any) => {
        const err = error?.response?.data;
        console.log(error);
        reject(new AppError("InternalServerError", err));
      });
  });
}
export async function GetProductId(url: string) {
  const { pathname }: URL = new URL(url);
  const filename = basename(pathname);
  const product_id = filename.replace(extname(filename), "");

  return product_id;
}
/* export async function GetProductDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      url,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
    } = req.body;
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    let tokenInfo = {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    };
    const product_id = await GetProductId(url);


    const product = await GetDetails({
      product_id,
      tokenInfo,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
    });
    const result = await getProductShippingServices(
      {
        sku_id: product.sku_id,
        country_code: "SA",
        product_id,
        product_num: "1",
        price_currency: "SAR",
      },
      tokenInfo
    );

    return res.json({ product, shipping: result });
  } catch (error) {
    console.log(error);
    next(error);
  }
} */

export async function GetProductDetailsTest(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      url,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
      lang,
    } = req.body;
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    let tokenInfo = {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    };
    const product_id = await GetProductId(url);
    /*     if (userType === "vendor")
      await CheckSubscription(user_id, "products_limit"); */

    const productInfo = await GetDetails({
      product_id,
      tokenInfo,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
      lang,
    });
    let result: any;

    try {
      result = await getProductShippingServices(
        {
          sku_id: productInfo.sku_id,
          country_code: "SA",
          product_id,
          product_num: "1",
          price_currency: "SAR",
        },
        tokenInfo
      );
    } catch (err: any) {
      console.error(err);
    }

    //NEW SHIpping
    let queryDeliveryReq = {
      quantity: 1,
      shipToCountry: "SA",
      productId: +product_id,
      language: "en_US",
      // source: "CN",
      source: "any",
      locale: "en_US",
      selectedSkuId: productInfo.sku_id,
      currency: "SAR",
    };
    let newShipping = false;
    let NewShippingResult: any;
    try {
      NewShippingResult = await getNewProductShippingServices(
        queryDeliveryReq,
        tokenInfo
      );
      if (NewShippingResult?.length > 0) {
        newShipping = true;
      }
    } catch (err: any) {
      console.error(err);
    }

    if (newShipping) {
      // console.log("newShipping is returned");

      result = NewShippingResult;
    }
    //NEW SHIPPING
    //

    let {
      merchant,
      main_price,
      metadata_title,
      metadata_description,
      name,
      price,
      ...body
    } = pick(productInfo, [
      "name",
      "description",
      "vendor_commission",
      "main_price",
      "price",
      "quantity",
      "sku",
      "images",
      "options",
      "metadata_title",
      "metadata_description",
      "product_type",
      "original_product_id",
      "merchant",
    ]) satisfies Partial<ProductSchema>;

    if (price < main_price) {
      [price, main_price] = [main_price, price];
    }
    const { role, _id } = req.user;
    // console.log("productInfo?.name", productInfo?.name);
    // console.log("productInfo?.metadata_title", productInfo?.metadata_title);
    // console.log(
    //   "productInfo?.metadata_description",
    //   productInfo?.metadata_description
    // );
    // console.log(
    //   "productInfo?.description.slice(0,12",
    //   productInfo?.description.slice(0, 12)
    // );
    const product = new Product({
      name: name,
      ...body,
      price,
      vendor_commission: 0,
      main_price,
      merchant: role === "client" ? _id : merchant,
      sku_id: productInfo.sku_id,
      vat: req.body?.vat && true,
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
      variantsArr: productInfo.variantsArr,
    });
    // console.log("product?.name", product?.name);
    let metadataDescSliced = productInfo.metadata_description;
    if (productInfo?.metadata_description?.length > 70) {
      metadataDescSliced = productInfo.metadata_description.slice(0, 70);
    }
    // console.log(
    //   "productInfo.description",
    //   productInfo.description.slice(0, 20)
    // );
    if (!productInfo.description) {
      // console.log("NO DESCRIPTION");
    }
    product.metadata_title = productInfo.metadata_title;
    product.metadata_description = metadataDescSliced;
    product.description = productInfo.description;

    const options = body?.options?.map((option: any) => {
      const values = option.values;
      return {
        ...option,
        values: values?.map((value: any) => {
          const valuePrice = value.original_price;
          /* const vendorOptionPrice = parseFloat(
            (valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2)
          ); */

          return {
            ...value,
            original_price: valuePrice,
            price: valuePrice,
          };
        }),
      };
    });

    product.options = options;
    let { category_id, category_name } = req.body;
    // product.category_name = category_name;
    // product.category_id = category_id;

    //@ts-ignore
    product.shipping = result;
    //@ts-ignore
    if (result?.length == 0) {
      product.shippingAvailable = false;
    } else if (result?.length > 0) {
      product.shippingAvailable = true;
    }
    // console.log("shippingAvailable", result?.length == 0);
    // console.log("result", result);

    const jsonProduct = product.toJSON();

    await product.save();
    return res.status(201).json({ success: true });
    /* 
    attachShippingInfoToProuct(
      product._id.toString(),
      product.original_product_id,
      req
    ); */
    //
  } catch (error) {
    console.log(error);
    next(error);
  }
}
