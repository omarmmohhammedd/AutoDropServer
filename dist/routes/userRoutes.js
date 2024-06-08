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
const express_1 = require("express");
require("../utils/passport");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const multer_1 = __importDefault(require("../assits/multer"));
const passport_google_oauth2_1 = require("passport-google-oauth2");
const aliExpressAuth_1 = require("../controllers/aliExpressAuth");
const tokenHandler_1 = require("../controllers/tokenHandler");
const router = (0, express_1.Router)();
router.post("/signup", authController_1.signUp);
router.post("/verify", authController_1.verify);
router.post("/signin", authController_1.signIn);
router.patch("/edit", multer_1.default.single("file"), authController_1.editProfile);
router.post("/sendmail", authController_1.sendForgetMail);
router.patch("/forgetpassword", authController_1.forgetPassword);
router.post("/saveToken", tokenHandler_1.saveTokenToUser);
router.get('/user/:id', authController_1.getUser);
/*  Google AUTH  */
let userProfile;
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.Backend_Link}auth/google/callback`,
    passReqToCallback: true,
}, function (req, accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        userProfile = profile;
        done(null, profile);
    });
}));
router.get("/google", passport_1.default.authenticate("google", { scope: ["email", "profile"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/error" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = yield (0, authController_1.generateProfile)(userProfile);
    res.redirect(`${process.env.Frontend_Link}/ar/${token}`);
}));
router.get("/error", (req, res) => {
    res.send("Something went wrong. try again");
});
//salla
router.get("/auth-salla", authController_1.sallaAuth);
router.get("/auth-salla/callback", authController_1.sallaCallback);
//aliexpress
router.get("/auth-aliexpress", aliExpressAuth_1.aliexpressAuth);
router.get("/auth-aliexpress/callback", aliExpressAuth_1.aliexpressCallback);
exports.default = router;
