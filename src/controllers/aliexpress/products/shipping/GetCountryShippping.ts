import { NextFunction, Request, Response } from "express";
import TokenUserExtractor from "../../../../utils/handlers/tokenUserExtractor";
import AliExpressToken from "../../../../models/AliExpressTokenModel";
import { GetSKUId } from "./GetProductsShipping";
import { getProductShippingServices } from "../../features/shipping";
import { getNewProductShippingServices } from "../../features/shipping/index";

export async function GetProductShippingDetailsByID(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { product_id } = req.body;
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    let tokenInfo = {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    };

    /*     if (userType === "vendor")
          await CheckSubscription(user_id, "products_limit"); */

    const skuid = await GetSKUId({ product_id, tokenInfo });
    let result = await getProductShippingServices(
      {
        sku_id: skuid,
        country_code: "SA",
        product_id,
        product_num: "1",
        price_currency: "SAR",
      },
      tokenInfo
    );

    // console.log("result",result);
    if (!result) {
      result = [];
    }
    return res.json({ shipping: result });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function GetShippingProductIdCountryCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { product_id, country_code } = req.body;
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    console.log("country_code", country_code);
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    let tokenInfo = {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    };

    /*     if (userType === "vendor")
        await CheckSubscription(user_id, "products_limit"); */

    const skuid = await GetSKUId({ product_id, tokenInfo });
    let result
    try{

      result = await getProductShippingServices(
       {
         sku_id: skuid,
         country_code,
         product_id,
         product_num: "1",
         price_currency: "SAR",
       },
       tokenInfo
     );
    }catch(err){
      console.error(err)
    }
    let queryDeliveryReq = {
      quantity: 1,
      shipToCountry: country_code,
      productId: product_id,
      language: "en_US",
      // source: "CN",
      source: "any",
      locale: "en_US",
      selectedSkuId: skuid,
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
    // console.log("result",result);
    if (newShipping) {
      console.log("newShipping is returned");
 
      return res.json({ shipping: NewShippingResult });
    } else {
      console.log("oldShipping is returned");
      console.log("oldShipping result", result);

      if (!result) {
        result = [];
      }
      return res.json({ shipping: result });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}
