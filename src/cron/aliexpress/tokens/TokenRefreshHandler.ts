//@ts-nocheck

import { schedule } from "node-cron";

import fs from "fs";
import User from "../../../models/user.model";
import SallaToken from "../../../models/SallaTokenModel";
import AliExpressToken from "../../../models/AliExpressTokenModel";
import qs from "qs";
import axios from "axios";
import { GenerateSign, GenerateValues } from "../../../controllers/aliexpress/features/GenerateSignature";
import dayjs from "dayjs";
import { pick } from "lodash";
import { RefreshTokenHandler } from "../../../controllers/salla/RefreshAccessToken";

// const time: string = "0 0 */5 * *";
const time: string = "*/10 * * * * *";

const TokenRefreshHandler = schedule(time, async function () {
  try {
    console.log("cron job started to refresh users token");

    let limit = 10;
    let page = 1;
    let options = {
      limit,
      page,
      populate: ["aliExpressToken", "sallaToken"],
    };
    let results;

    let users;


    do {
      results = await User.paginate({}, options);
      users = results.docs;
      for (const user of users) {
        let { aliExpressToken, sallaToken } = user;
        let sallaDoc = await SallaToken.findOne({
          _id: sallaToken,
        });
        if (!sallaDoc) continue;
        const refresh = await RefreshTokenHandler(sallaDoc.accessToken,sallaToken)
        // const {data:info} = await GetUserInfo(sallaDoc.accessToken)
        // const { data: userInfo } = info;
        // console.log(userData)
        // if (sallaDoc) {
        //   let { accessToken, refreshToken } = sallaDoc;
        //   let sallaReqOpt = {
        //     method: "post",
        //     url: "https://accounts.salla.sa/oauth2/token",
        //     headers: {
        //       "Content-Type": "application/x-www-form-urlencoded",
        //       Authorization: "Bearer " + accessToken,
        //     },
        //     data: qs.stringify({
        //       refresh_token: refreshToken,
        //       grant_type: "refresh_token",
        //       client_id: process.env.SALLA_CLIENT_ID,
        //       client_secret: process.env.SALLA_CLIENT_SECRET,
        //     }),
        //   };
        //   // console.log(sallaReqOpt)
        //   let sallaRefreshTokenRes = await axios(sallaReqOpt);
        //   // console.log("sallaRefreshTokenRes",sallaRefreshTokenRes)
        //   // console.log(sallaRefreshTokenRes)
        //   let { access_token, refresh_token,expires_in } = sallaRefreshTokenRes.data;

        //   fs.appendFile("sallaTokenCRON.json", JSON.stringify({ access_token, refresh_token }), () => {});

        //   sallaDoc.accessToken = access_token;
        //   sallaDoc.refreshToken = refresh_token;
        //   sallaDoc.expires_in = expires_in
        //   await sallaDoc.save();
        // }

        // let aliExpressDoc = await AliExpressToken.findById(aliExpressToken);

        // if(aliExpressDoc){
        //   const app_key =process.env.APP_KEY!
        //   const refresh_token = aliExpressDoc.refreshToken
        //   const secret = process.env.APP_SECRET!
        //   const base = process.env.ALI_API_BASE!
        //   const timestamp = new Date(
        //     dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
        //   ).getTime();
        //   const method = "/auth/token/refresh";
        //   const body = {
        //     app_key,
        //     refresh_token,
        //     sign_method: "sha256",
        //     timestamp,
        //     method,
        //   };
    
        //   const values = GenerateValues(body);
        //   const sign = GenerateSign(values);
        //   const { data } = await axios.get(base, {
        //     params: { ...body, sign },
        //   });
    
        //   const key = method + "_response";
        //   const result = data[key];
      
        //   const error = data.error_response;
        //   const {
        //     access_token,
        //     refresh_token: _refresh_token,
        //     expire_time,
        //     refresh_token_valid_time,
        //   } = pick(result, [
        //     "access_token",
        //     "refresh_token",
        //     "expire_time",
        //     "refresh_token_valid_time",
        //   ]);
        //   aliExpressDoc.accessToken = access_token
        //   aliExpressDoc.refreshToken = _refresh_token
        //   console.log("access_token",access_token)
        //   console.log("refresh_token",_refresh_token)
        //   await aliExpressDoc.save()
        // }
    }
    page++;
    options.page = page;
    } while (users.length == limit);
  } catch (error) {
    console.log("Error while refreshing user tokens..");
    // console.log(error.response.data);
    console.log(error)
  }
});

export default TokenRefreshHandler;


async function  GetUserInfo(token: string): Promise<any> {

  const options: AxiosRequestConfig<any> = {
    baseURL: 'https://api.salla.dev/admin/v2/',
    url:'oauth2/user/info',
    method:'get',
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    timeout:100000
  };
  
  try {
    return await axios(options);
  } catch (error) {
  }
}
