import { NextFunction, Request, Response } from "express";
import querystring from "querystring";

import axios from "axios";
import SallaToken from "../../models/SallaTokenModel";
import catchAsync from "../../utils/catchAsync";
export const RefreshTokenHandler = async (
  oldToken: string,
  sallaTokenDocId: any
) => {
  /* let { data: resp } = await axios.patch(
    `${process.env.Backend_Link}salla/refreshToken/${oldToken}`,
    {},
    {
      headers: {
        Authorization: reqToken,
      },
    }
  ); */
  console.log("reached RefreshTokenHandler");
  const salla: any = await SallaToken.findOne({
    accessToken: oldToken,
  });
  if (!salla) {
    // return res.status(404).json({ message: "Salla token not found" });
     return;
  }
  let { refreshToken } = salla;
  /* if (accessToken !== salla.accessToken) {
    return res
      .status(401)
      .json({ message: "access token is not for this user" });
  } */
  let data = {
    client_id: process.env.SALLA_CLIENT_ID,
    client_secret: process.env.SALLA_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };
  const updateSallaToken = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Authorization: "Bearer " + oldToken,
    },
    url: `https://accounts.salla.sa/oauth2/token`,
    data,
  };

  console.log("hereee");
  try {
    const { data: PatchResponse } = await axios.request(updateSallaToken);
    console.log(PatchResponse);
    console.log(PatchResponse.access_token);
    await SallaToken.findByIdAndUpdate(sallaTokenDocId, {
      accessToken: PatchResponse.access_token,
      refreshToken: PatchResponse.refresh_token,
    });
    if (!PatchResponse) {
      /*      res.status(400).json({
        status: "failed",
      }); */
      return false
    }
    return true
  } catch (err: any) {
    console.log(err?.response?.data);
    console.log("error");
  }

  /*   res.status(200).json({
    status: "success",
  }); */
};
export const RefreshAccessToken = catchAsync(
  async (req: Request & any, res: Response, next: NextFunction) => {
    let { accessToken } = req.params;
    console.log("reached RefreshAccessToken");
    // const salla = await SallaToken.findById(req.user.sallaToken);
    const salla = await SallaToken.findById({
      accessToken: accessToken,
    });
    if (!salla) {
      return res.status(404).json({ message: "Salla token not found" });
    }
    let { refreshToken } = salla;

    /* if (accessToken !== salla.accessToken) {
      return res
        .status(401)
        .json({ message: "access token is not for this user" });
    } */
    let data = {
      client_id: "00acf69f-82be-4880-85e5-0496fb571fd4",
      client_secret: "2520f91a575d0bb07579341bea3e10ff",
      // refresh_token: refreshToken,
      refresh_token:
        "ory_rt_BXajU-24NRUGbBIP_dgS7_Bf94XjKj1Q2ZggxwvmuGM.mSQWJequ9WeqyRrQd6k9oKnPNHwTwU8A6PagmBY11ZI",
      grant_type: "refresh_token",
    };
    const updateSallaToken = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      url: `https://accounts.salla.sa/oauth2/token`,
      data,
    };
    try {
      const { data: PatchResponse } = await axios.request(updateSallaToken);
      console.log(PatchResponse);
      console.log(PatchResponse);
      console.log(PatchResponse);
      console.log(PatchResponse);
      console.log(PatchResponse);
      console.log(PatchResponse.access_token);
      await SallaToken.findByIdAndUpdate(req.user.sallaToken, {
        accessToken: PatchResponse.access_token,
      });
      if (!PatchResponse) {
        res.status(400).json({
          status: "failed",
        });
      }
    } catch (err: any) {
      console.log("error");
    }

    res.status(200).json({
      status: "success",
    });
  }
);
