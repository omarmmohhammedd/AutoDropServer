import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../utils/catchAsync";
import AppError from "../../../../utils/appError";
import TokenUserExtractor from "../../../../utils/handlers/tokenUserExtractor";
import AliExpressToken from "../../../../models/AliExpressTokenModel";
import MakeRequest, { MakeRequestImage } from "../../features/Request";
import { extname, basename } from "path";
import axios from "axios";
// let translate: any;


export async function GetProductId(url: string) {
  const { pathname }: URL = new URL(url);
  const filename = basename(pathname);
  const product_id = filename.replace(extname(filename), "");

  return product_id;
}
function generateRandomNumber(start: any, end: any) {
  var randomDecimal = Math.random();

  var randomInRange = randomDecimal * (end - start + 1);

  var randomInteger = Math.floor(randomInRange) + start;

  return randomInteger;
}
export const GetRecommendedProductsByURL = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    let { url } = req.body;
    async function getOriginalUrl(shortUrl: string) {
      const response = await axios.get(shortUrl, {
        maxRedirects: 0, // Prevent axios from following redirects
        validateStatus: function (status:number) {
          return status >= 200 && status < 400; // Accept all status codes below 400
        },
      });
    
      return response.headers.location; // This is the original URL
    }
    const shortUrl = 'https://a.aliexpress.com/_okjpgk0';

    const originalUrl = await getOriginalUrl(shortUrl);
console.log("originalUrl",originalUrl)




    // get first_level_category_id if not get second level
    // iterate through the feedname and get the products
    let product_id = await GetProductId(url);
if(isNaN(Number(product_id))){
  let originalProductURL =await getOriginalUrl(url )
   product_id = await GetProductId(originalProductURL);

}

console.log("url",url)
    console.log("product_id", product_id);
    console.log("typeof product_id", typeof product_id);
    console.log(req.query);
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    const { lang } = req.query;
    let result: any = [];
    let tokenInfo = {
      aliExpressAccessToken: aliexpressToken?.accessToken,
      aliExpressRefreshToken: aliexpressToken?.refreshToken,
    };
 let promisesArr = []
    let productInfoResp =  MakeRequest(
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

    let response =  MakeRequest(
      {
        method: "aliexpress.ds.feedname.get",
        sign_method: "sha256",
      },
      {
        aliExpressAccessToken: aliexpressToken?.accessToken,
        aliExpressRefreshToken: aliexpressToken?.refreshToken,
      }
    );

    promisesArr.push(productInfoResp)
    promisesArr.push(response)
    try{
      let promisesRes = await Promise.all(promisesArr)
let searchedProduct = promisesRes[0]?.data?.aliexpress_ds_product_get_response?.result?.ae_item_sku_info_dtos?.[0]
let searchedProductResult =  promisesRes[0]?.data?.aliexpress_ds_product_get_response?.result
let searchedProductFirstVariant =searchedProductResult?.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o?.[0]
console.log("searchedProductResult?.ae_item_base_info_dto",searchedProductResult?.ae_item_base_info_dto?.avg_evaluation_rating)

console.log("searchedProductResult",searchedProductResult)
let selectedProductImages =promisesRes[0]?.data?.aliexpress_ds_product_get_response?.result?.ae_multimedia_info_dto?.image_urls.split(';')
let product_title = searchedProductResult?.ae_item_base_info_dto?.subject
let searchedProductObject ={
  target_original_price: searchedProductFirstVariant?.sku_price,
  product_main_image_url: selectedProductImages?.[0],
  target_sale_price: searchedProductFirstVariant?.offer_sale_price,
  product_title ,
  product_id : searchedProductResult?.ae_item_base_info_dto?.product_id,
  evaluate_rate : (searchedProductResult?.ae_item_base_info_dto?.avg_evaluation_rating *100)/5 + "%",
  product_detail_url:url
  // product_title : searchedProductResult?.ae_item_base_info_dto?.subject
}
/* if(lang=="ar"){
  import('translate').then((module) => {
    translate = module;
    // You can use translate here...
    translate(product_title, { to: 'ar' }).then((text:string) => {
      console.log(text); 
      searchedProductObject.product_title = text
    });
  });
} */
result.push(searchedProductObject)
/* 

  {
          "original_price": "0.01",
          "product_small_image_urls": [],
          "second_level_category_name": "Home Textile",
          "product_detail_url": "https://www.aliexpress.com/item/32832712618.html",
          "target_sale_price": "0.01",
          "second_level_category_id": "405",
          "discount": "10%",
          "product_main_image_url": "https://ae04.alicdn.com/kf/HTB1zQFrj93PL1JjSZFtxh7lRVXa0.jpeg",
          "first_level_category_id": "15",
          "target_sale_price_currency": "USD",
          "original_price_currency": "USD",
          "platform_product_type": "ALL",
          "shop_url": "https://www.aliexpress.com/store/402172",
          "target_original_price_currency": "USD",
          "product_id": "32832712618",
          "seller_id": "200042360",
          "target_original_price": "0.01",
          "product_video_url": "https://xxx.html",
          "first_level_category_name": "Home \u0026 Garden",
          "ship_to_days": "10",
          "evaluate_rate": "0.0%",
          "sale_price": "0.01",
          "product_title": "test-test-womenJeans-999",
          "shop_id": "402172",
          "sale_price_currency": "USD",
          "lastest_volume": "28"
        }*/
      let respData = promisesRes[1];
  
      while (result.length < 19) {
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
            target_language: lang,
            sign_method: "sha256",
  
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
        console.log(
          resPage?.data.aliexpress_ds_recommend_feed_get_response?.result
        );
        if (products) {
          result.push(...products);
          console.log(result.length);
        }
      }
      console.log(result.length);
  
      if (!result.length) throw new AppError("Products Not Found", 409);
      res.json({ result: result.slice(0, 20) });
    }catch(err){
      console.log(err)
      throw new AppError("Products Not Found", 409);
    }
  }
);

export const GetRecommendedProductsByCategory = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    let { categoryName } = req.body;

    const categories: any = {
      stationary: [21, 34, 1420],
      electronics: [6, 44, 502],
      sportsSupplies: [18, 34, 1501],
      accessories: [44, 1501],
      smartDevices: [44, 509],
      perfumes: [66],
      cosmeticProducts: [66],
      clothes: [3, 66, 1501],
      decor: [15, 39, 1503],
    };
    const currentCategory = categories[categoryName];

    console.log("currentCategory", currentCategory);
    console.log(req.query);
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

    let i = 0;
    let promosLength =
      respData.data.aliexpress_ds_feedname_get_response?.resp_result.result
        .promos.promo.length - 1;
    while (result.length < 20 && i < promosLength) {
      let currFeedName =
        respData.data.aliexpress_ds_feedname_get_response?.resp_result.result
          .promos.promo[i].promo_name;

      const randomCategoryIdIndex = generateRandomNumber(
        0,
        currentCategory.length - 1
      );
      const randomCategoryId = currentCategory[randomCategoryIdIndex];

      let response2 = await MakeRequest(
        {
          method: "aliexpress.ds.recommend.feed.get",
          target_currency: "SAR",
          country: "SA",
          feed_name: currFeedName,
          target_language: lang,
          page_size: 10,
          sign_method: "sha256",

          category_id: randomCategoryId,
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
      i += 1;
    }
    console.log(result.length);

    if (!result.length) throw new AppError("Products Not Found", 409);
    res.json({ result: result.slice(0, 20) });
  }
);

export const GetRecommendedProductsByImage = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    let user: any = await TokenUserExtractor(req);
    if (!user) return res.status(401).json({ message: "token is invalid" });
    let aliexpressToken = await AliExpressToken.findOne({ userId: user?._id });
    const { lang } = req.query;

    let formData = req.body;
    console.log("formData", formData);
    let result: any = [];

    let response2 = await MakeRequestImage(
      {
        shpt_to: "SA",
        target_currency: "SAR",
        product_cnt: 20,
        target_language: lang,
        // sort: "SALE_PRICE_ASC",
        method: "aliexpress.ds.image.search",
        sign_method: "sha256",
      },
      {
        aliExpressAccessToken: aliexpressToken?.accessToken,
        aliExpressRefreshToken: aliexpressToken?.refreshToken,
      },
      req.file
    );
    let resPage = response2;

    console.log("resPage", resPage);
    console.log(
      "resPage?.aliexpress_ds_image_search_response",
      resPage?.data?.aliexpress_ds_image_search_response
    );
    console.log(
      "resPage?.aliexpress_ds_image_search_response?.data",
      resPage?.data?.aliexpress_ds_image_search_response?.data
    );
    console.log(
      "resPage?.aliexpress_ds_image_search_response?.data?.products?.traffic_image_product_d_t_o",
      resPage?.data?.aliexpress_ds_image_search_response?.data?.products
        ?.traffic_image_product_d_t_o
    );
    const products =
      resPage?.data?.aliexpress_ds_image_search_response?.data?.products
        ?.traffic_image_product_d_t_o;
    if (!products || !products.length)
      throw new AppError("Products Not Found", 409);
    if (products) {
      result.push(...products);
      console.log(result.length);
    }
    // }
    console.log(result.length);

    if (!result.length) throw new AppError("Products Not Found", 409);
    res.json({ result: result.slice(0, 20) });
  }
);
