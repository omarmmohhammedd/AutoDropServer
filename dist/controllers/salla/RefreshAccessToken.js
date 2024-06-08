"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshAccessToken = exports.RefreshTokenHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const SallaTokenModel_1 = __importDefault(require("../../models/SallaTokenModel"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const RefreshTokenHandler = (oldToken, sallaTokenDocId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    const salla = yield SallaTokenModel_1.default.findOne({
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
        const { data: PatchResponse } = yield axios_1.default.request(updateSallaToken);
        console.log(PatchResponse);
        console.log(PatchResponse.access_token);
        yield SallaTokenModel_1.default.findByIdAndUpdate(sallaTokenDocId, {
            accessToken: PatchResponse.access_token,
            refreshToken: PatchResponse.refresh_token,
        });
        if (!PatchResponse) {
            /*      res.status(400).json({
              status: "failed",
            }); */
            return false;
        }
        return true;
    }
    catch (err) {
        console.log((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data);
        console.log("error");
    }
    /*   res.status(200).json({
      status: "success",
    }); */
});
exports.RefreshTokenHandler = RefreshTokenHandler;
exports.RefreshAccessToken = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { accessToken } = req.params;
    console.log("reached RefreshAccessToken");
    // const salla = await SallaToken.findById(req.user.sallaToken);
    const salla = yield SallaTokenModel_1.default.findById({
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
        refresh_token: "ory_rt_BXajU-24NRUGbBIP_dgS7_Bf94XjKj1Q2ZggxwvmuGM.mSQWJequ9WeqyRrQd6k9oKnPNHwTwU8A6PagmBY11ZI",
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
        const { data: PatchResponse } = yield axios_1.default.request(updateSallaToken);
        console.log(PatchResponse);
        console.log(PatchResponse);
        console.log(PatchResponse);
        console.log(PatchResponse);
        console.log(PatchResponse);
        console.log(PatchResponse.access_token);
        yield SallaTokenModel_1.default.findByIdAndUpdate(req.user.sallaToken, {
            accessToken: PatchResponse.access_token,
        });
        if (!PatchResponse) {
            res.status(400).json({
                status: "failed",
            });
        }
    }
    catch (err) {
        console.log("error");
    }
    res.status(200).json({
        status: "success",
    });
}));
