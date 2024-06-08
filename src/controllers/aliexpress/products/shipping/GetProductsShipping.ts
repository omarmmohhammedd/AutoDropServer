import { NextFunction, Request, Response } from "express";
import TokenUserExtractor from "../../../../utils/handlers/tokenUserExtractor";
import AliExpressToken from "../../../../models/AliExpressTokenModel";
import MakeRequest from "../../features/Request";
import AppError from "../../../../utils/appError";
import { getNewProductShippingServices, getProductShippingServices } from "../../features/shipping";
export async function GetSKUId({
  product_id,
  tokenInfo,
}: {
  product_id: string;
  tokenInfo: any;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    MakeRequest(
      {
        ship_to_country: "SA",
        product_id: product_id,
        target_currency: "SAR",
        target_language: "AR",
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

          const skusId: any =
            ae_item_sku_info_dtos.ae_item_sku_info_d_t_o[0].sku_id;
          console.log(skusId);
          resolve(skusId);
          /*  const { subject, product_id, detail }: any =
              ae_item_base_info_dto || {};
  
            const { ae_item_sku_info_d_t_o: SKUs }: any =
              ae_item_sku_info_dtos || {};
  
            const [{ price, quantities, options }, images] = await Promise.all([
              GetProductOptions(SKUs || []),
              GetProductImages(ae_multimedia_info_dto?.image_urls),
            ]);
  
            const values = new Array().concat(
              ...options?.map((e: any) => e.values)
            );
            const hasValues = values.length;
  
            const data: ProductSchema = {
              name: subject,
              description: detail,
              price: price,
              main_price: price,
              quantity: quantities,
              sku: uuid(),
              images: images
                ?.slice(0, 10)
                ?.map((img: ImageType, index: number) => ({
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
            };
            const product = new Product(data).toJSON();
  
            resolve(product); */
        }
      })
      .catch((error: AppError | any) => {
        const err = error?.response?.data;
        console.log(error);
        reject(new AppError("InternalServerError", err));
      });
  });
}
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
    let queryDeliveryReq = {
      quantity: 1,
      shipToCountry: "SA",
      productId: product_id,
      language: "en_US",
      source: "CN",
      locale: "en_US",
      selectedSkuId: skuid,
      currency: "SAR",
    };
    try{

      let NewShippingResult = await getNewProductShippingServices(
        queryDeliveryReq,
        tokenInfo
      );
    }catch(err:any){
      console.error(err)
    
    }
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
export async function GetNewShipping(
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

  let NewShippingResult
    const skuid = await GetSKUId({ product_id, tokenInfo });
    let queryDeliveryReq = {
      quantity: 1,
      shipToCountry: "SA",
      productId: product_id,
      language: "en_US",
      // source: "CN",
      source: "any",
      locale: "en_US",
      selectedSkuId: skuid,
      currency: "SAR",
    };
    try {
      NewShippingResult = await getNewProductShippingServices(
        queryDeliveryReq,
        tokenInfo
      );

    } catch (err: any) {

      console.error(err);
    
    return res.json({shipping:[]})
    }


    // console.log("result",result);
    if (!NewShippingResult) {
      NewShippingResult = [];
    }
    return res.json({ shipping: NewShippingResult });
  } catch (error) {
    console.log(error);
    next(error);
  }
}
