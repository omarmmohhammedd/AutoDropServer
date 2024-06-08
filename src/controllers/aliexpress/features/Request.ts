import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import { GenerateValues, GenerateSign } from "./GenerateSignature";
// import findSettingKey from "../settings";
import qs from "qs";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function MakeRequest(
  values: any,
  aliToken: any
): Promise<any> {
  const timestamp = new Date(
    dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
  ).getTime();

  const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH] = await Promise.all([
    // findSettingKey("ALI_APP_KEY"),
    process.env.APP_KEY,
    process.env.ALI_API_BASE,
    aliToken.aliExpressAccessToken,
    aliToken.aliExpressRefreshToken,
    // findSettingKey("ALI_TOKEN"),
    // findSettingKey("ALI_REFRESH_TOKEN"),
  ]);

  const data = {
    ...values,
    app_key: ALI_APP_KEY,
    access_token: ALI_TOKEN,
    timestamp,
  };

  const sign = GenerateSign(GenerateValues(data));

  return axios({
    url: ALI_BASE + "/" + values?.method,
    method: "post",
    data: {
      ...data,
      sign,
    },
  });
}

export async function MakeRequestImage(
  values: any,
  aliToken: any,
  imageBytes: any
): Promise<any> {
  const timestamp = new Date(
    dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
  ).getTime();

  const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH] = await Promise.all([
    process.env.APP_KEY,
    process.env.ALI_API_BASE,
    aliToken.aliExpressAccessToken,
    aliToken.aliExpressRefreshToken,
  ]);

  const data = {
    ...values,
    app_key: ALI_APP_KEY,
    timestamp,
  };
  const dataReference = {
    shpt_to: "SA",
    target_currency: "SAR",
    product_cnt: 10,
    target_language: "EN",
    sort: "SALE_PRICE_ASC",
    method: "aliexpress.ds.image.search",
    app_key: ALI_APP_KEY,
    sign_method: "sha256",
    timestamp: "1710788659736",
  };
  const sign = GenerateSign(GenerateValues(data));
  console.log("sign", sign);
  console.log("sign", sign);
  console.log("sign", sign);
  console.log("sign", sign);
  console.log("sign", sign);
  let data2 = {
    ...data,
    sign,
  };

  
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }

  formData.append("sign", sign);

  let file = new File([imageBytes.buffer], imageBytes.originalname, { type: imageBytes.mimetype });
  formData.append('image_file_bytes', file);
  console.log("imageBytes", imageBytes);
  return axios({
    url: ALI_BASE + "/" + values?.method,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data; charset=utf-8",
    },
  });
}
