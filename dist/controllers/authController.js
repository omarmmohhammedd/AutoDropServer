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
exports.getUser = exports.sallaCallback = exports.sallaAuth = exports.generateProfile = exports.sendForgetMail = exports.forgetPassword = exports.editProfile = exports.verify = exports.signIn = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const sendMails_1 = __importDefault(require("../assits/sendMails"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const user_model_1 = __importDefault(require("../models/user.model"));
const authHelperFunction_1 = require("../utils/authHelperFunction");
const verifyEmail_1 = require("../utils/verifyEmail");
const libphonenumber_js_1 = require("libphonenumber-js");
const SallaRequest_1 = __importDefault(require("../utils/handlers/SallaRequest"));
const generator_1 = require("./Webhook/handlers/generator");
const secret = speakeasy_1.default.generateSecret({ length: 20 });
let validateEmail = function (email) {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
exports.signUp = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role, phone } = req.body;
    if (!name) {
        return next(new appError_1.default("please enter your name", 400));
    }
    if (!email) {
        return next(new appError_1.default("please enter your email", 400));
    }
    if (!validateEmail(email)) {
        return next(new appError_1.default("please enter a valid email", 400));
    }
    if (!password) {
        return next(new appError_1.default("please enter your password", 400));
    }
    let existingUser = yield user_model_1.default.findOne({ email: email });
    if (existingUser && existingUser.active) {
        return next(new appError_1.default("Email already exists please sign in instead.", 400));
    }
    const code = (0, verifyEmail_1.generateVerificationCode)();
    yield (0, verifyEmail_1.sendVerificationCode)(email, code);
    // let hashed = await hashPassword(password);
    let hashed = (0, authHelperFunction_1.newHashPassword)(password);
    // console.log("hashed", hashed);
    // console.log("password", password);
    let user;
    // console.log(parsePhoneNumberFromString(phone)!.country!);
    // console.log(parsePhoneNumberFromString(phone)!);
    if (existingUser) {
        // Update the existing user
        existingUser.password = hashed;
        existingUser.role = role;
        existingUser.code = code;
        existingUser.phone = phone;
        existingUser.name = name;
        existingUser.country = (0, libphonenumber_js_1.parsePhoneNumberFromString)(phone).country;
        yield existingUser.save();
        user = existingUser;
    }
    else {
        // Create a new user
        let hashed = (0, authHelperFunction_1.newHashPassword)(password);
        user = yield user_model_1.default.create({
            name,
            email,
            password: hashed,
            role,
            code,
            phone,
            country: (0, libphonenumber_js_1.parsePhoneNumberFromString)(phone).country,
        });
    }
    res.status(201).json({
        status: "success",
        message: "User registered successfully. Please check your email for the verification code.",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active,
            },
        },
    });
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_model_1.default.findOneAndUpdate({ name, email, code }, { password: hashed });
    }), 10000);
}));
exports.signIn = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email) {
        return next(new appError_1.default("please enter your email", 400));
    }
    if (!password) {
        return next(new appError_1.default("please enter your password", 400));
    }
    const user = yield user_model_1.default.findOne({ email }).populate({
        path: "subscription",
        select: "plan start_date expiry_date orders_limit products_limit",
        populate: {
            path: "plan",
            select: "name orders_limit products_limit",
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 401));
    }
    // console.log(
    //   "newComparePassword(password, hashedPassword)",
    //   newComparePassword("A2@gmail.com", newHashPassword("A2@gmail.com"))
    // );
    // console.log(
    //   "newComparePassword(password, hashedPassword)",
    //   newComparePassword(password, newHashPassword(password))
    // );
    let passwordCorrect = (0, authHelperFunction_1.newComparePassword)(password, user.password);
    if (!passwordCorrect) {
        return next(new appError_1.default("Invalid password", 401));
    }
    let userJSON = user.toJSON();
    userJSON.planName = userJSON.subscription.plan.name;
    userJSON.subscriptionStart = userJSON.subscription.start_date;
    userJSON.subscriptionExpiry = userJSON.subscription.expiry_date;
    userJSON.subscriptionOrdersLimit = userJSON.subscription.orders_limit;
    userJSON.subscriptionProductsLimit = userJSON.subscription.products_limit;
    userJSON.id = userJSON._id.toString();
    userJSON.totalOrdersLimit = userJSON.subscription.plan.orders_limit;
    userJSON.totalProductsLimit = userJSON.subscription.plan.products_limit;
    // if (!user.active) {
    //   return next(
    //     new AppError("please sign up instead and verify your email.", 401)
    //   );
    // }
    // console.log(userJSON);
    (0, authHelperFunction_1.responseAndToken)(userJSON, res, 200, req);
}));
exports.verify = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    // console.log("here");
    // Find the user with the provided email
    const user = yield user_model_1.default.findOne({ email }).populate({
        path: "subscription",
        select: "plan start_date expiry_date orders_limit products_limit",
        populate: {
            path: "plan",
            select: "name orders_limit products_limit",
        },
    });
    //@ts-ignore
    // console.log(user.code);
    // console.log(code);
    if (!user) {
        return next(new appError_1.default("User not found", 404));
    }
    // Check if the verification code matches the one in the database
    if (user.code !== code) {
        return next(new appError_1.default("Invalid verification code", 400));
    }
    // If the codes match, activate the user's account
    user.active = true;
    yield user.save();
    let userJSON = user.toJSON();
    userJSON.planName = userJSON.subscription.plan.name;
    userJSON.subscriptionStart = userJSON.subscription.start_date;
    userJSON.subscriptionExpiry = userJSON.subscription.expiry_date;
    userJSON.subscriptionOrdersLimit = userJSON.subscription.orders_limit;
    userJSON.subscriptionProductsLimit = userJSON.subscription.products_limit;
    userJSON.id = userJSON._id.toString();
    userJSON.totalOrdersLimit = userJSON.subscription.plan.orders_limit;
    userJSON.totalProductsLimit = userJSON.subscription.plan.products_limit;
    (0, authHelperFunction_1.responseAndToken)(userJSON, res, 200, req);
}));
exports.editProfile = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.password &&
        (!req.body.confirmPassword || !req.body.currentPassword)) {
        return next(new appError_1.default("please enter your current password", 400));
    }
    let password = null;
    let user = yield user_model_1.default.findById(req.user.id);
    if (req.body.password) {
        password = yield bcrypt_1.default.hash(req.body.password, 10);
    }
    let same = yield bcrypt_1.default.compare(req.body.currentPassword, user.password);
    if (!same) {
        return next(new appError_1.default("wrong password", 400));
    }
    let update = {
        name: req.body.name || req.user.name,
        email: req.body.email || req.user.email,
        image: req.file ? req.file.path : req.user.image,
        phone: req.body.phone || req.user.phone,
        country: req.body.country || req.user.country,
        merchantID: req.body.merchantID || req.user.merchantID,
        storeName: req.body.storeName || req.user.storeName,
        storeLink: req.body.storeLink || req.user.storeLink,
        id: req.user.id,
    };
    yield user_model_1.default.findByIdAndUpdate(req.user.id, update);
    const token = jsonwebtoken_1.default.sign(update, "HS256", {
        expiresIn: "24h",
    });
    return res.status(200).json(token);
}));
exports.forgetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, OTP, password, confirmPassword } = req.body;
    // console.log(id, OTP, password, confirmPassword);
    if (!id)
        return next(new appError_1.default("wrong data", 400));
    if (!OTP)
        return next(new appError_1.default("Wrong data", 400));
    if (!password)
        return next(new appError_1.default("please enter your password", 400));
    if (confirmPassword != password)
        return next(new appError_1.default("passwords don't match", 400));
    let user = yield user_model_1.default.findOne({ _id: id, OTP: OTP });
    if (!user) {
        return next(new appError_1.default("wrong data", 400));
    }
    else {
        // let hashed: string = await bcrypt.hash(password, 10);
        let hashed = (0, authHelperFunction_1.newHashPassword)(password);
        const code = speakeasy_1.default.totp({
            secret: secret.base32,
            encoding: "base32",
        });
        // console.log("password", password);
        // console.log("hashed", hashed);
        yield user_model_1.default.findOneAndUpdate({ _id: id, OTP: OTP }, { OTP: code, password: hashed });
        return res.status(200).json("password changed successfully");
    }
}));
exports.sendForgetMail = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, locale } = req.body;
    let check = validateEmail(email);
    if (!check)
        return next(new appError_1.default("please enter a valid email", 400));
    const user = yield user_model_1.default.findOne({ email: email });
    if (!user) {
        return next(new appError_1.default("email doesn't exist", 400));
    }
    const code = speakeasy_1.default.totp({
        secret: secret.base32,
        encoding: "base32",
    });
    user.OTP = code;
    let base = process.env.Frontend_Link;
    const url = `${base}/${locale}/resetPassword/${user._id}/${user.OTP}`;
    (0, sendMails_1.default)("اعاده تعيين كلمه السر", `<h4>اضغط علي الرابط التالي لاعاده تعيين كلمه المرر</h4><a href=${url}>${url}<a/> <h4>فريق [Auto Drop]</h4>`, email);
    user.save();
    return res.status(200).json("message sent");
}));
const generateProfile = (userProfile) => __awaiter(void 0, void 0, void 0, function* () {
    let email = userProfile._json.email, name = userProfile._json.name;
    let user = yield user_model_1.default.findOne({ email: email }), token = null;
    if (user) {
        let tmp = {
            name: user.name,
            image: user.image,
            id: user._id,
            role: user.role,
            email: user.email,
            aliExpressToken: user === null || user === void 0 ? void 0 : user.aliExpressToken,
            sallaToken: user === null || user === void 0 ? void 0 : user.sallaToken,
            uniqueId: user.uniqueId
        };
        token = jsonwebtoken_1.default.sign(tmp, process.env.JWT_ACCESS_SECRET);
    }
    else {
        let randm = Math.floor(Math.random() * 10000) + 1;
        let original = (0, generator_1.generatePassword)(10);
        let pass = yield bcrypt_1.default.hash(original, 10);
        user = yield user_model_1.default.create({
            email: email,
            name: name,
            password: pass,
            image: userProfile._json.picture,
        });
        token = jsonwebtoken_1.default.sign({
            _id: user._id,
            email: email,
            name: name,
            role: user.role,
            image: userProfile._json.picture,
            uniqueId: user.uniqueId
        }, process.env.JWT_ACCESS_SECRET);
        (0, sendMails_1.default)("👋 ترحيب", `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاصك بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`, email);
    }
    return token;
});
exports.generateProfile = generateProfile;
const sallaData = {
    client_id: process.env.SALLA_CLIENT_ID,
    client_secret: process.env.SALLA_CLIENT_SECRET,
    salla_api_url: process.env.SALLA_API_URL,
    auth_url: "https://accounts.salla.sa/oauth2/auth",
    token_url: "https://accounts.salla.sa/oauth2/token",
    callback_url: "https://autodropserver.onrender.com/api/v1/auth/auth-salla/callback",
    // callback_url:"https://manatee-gorgeous-deeply.ngrok-free.app/api/v1/auth/auth-salla/callback",
};
exports.sallaAuth = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.cookies);
    const url = `${sallaData.auth_url}?client_id=${sallaData.client_id}&redirect_url=${sallaData.callback_url}&response_type=code&state=125478950&scope=offline_access&client_secret=${sallaData.client_secret}`;
    res.redirect(url);
}));
exports.sallaCallback = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        client_id: sallaData.client_id,
        client_secret: sallaData.client_secret,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_url: sallaData.callback_url,
        scope: "offline_access",
        state: req.query.state,
    };
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }
    const response = yield fetch(`${sallaData.token_url}`, {
        method: "POST",
        body: formData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const responseJson = yield response.json();
    // console.log(responseJson);
    if (response.ok) {
        const resStore = yield fetch(`${sallaData.salla_api_url}/store/info`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${responseJson.access_token}`,
            },
        });
        if (response.ok) {
            // console.log("SALLA resStore", resStore);
            try {
                let sallaReqOptUser = {
                    method: "GET",
                    url: "/oauth2/user/info",
                    token: responseJson.access_token,
                };
                let userSallaInfo = yield (0, SallaRequest_1.default)(sallaReqOptUser);
                let { data } = userSallaInfo;
                // console.log("datauserSallaInfo",userSallaInfo )
                let merchantID = data.data.merchant.id;
                // console.log("merchantIDSALLA",merchantID )
                //           if (merchantID) {
                //             let merchantExist = await User.findOne({
                //             merchantID,
                //             });
                //           if (merchantExist) {
                //             const frontendLink = new URL(
                //             (process.env.Frontend_Link + "/en/link-account?merchantAlreadyConnected=true") as string
                //             ) ;
                //             return res.redirect(frontendLink.toString());
                //   }
                // }
            }
            catch (err) {
                console.error(err);
            }
            const accessToken = responseJson.access_token;
            const refreshToken = responseJson.refresh_token;
            const frontendLink = new URL((process.env.Frontend_Link + "/en/LinkAccountAuth"));
            frontendLink.searchParams.append("accessToken", accessToken);
            frontendLink.searchParams.append("refreshToken", refreshToken);
            frontendLink.searchParams.append("tokenType", "Salla");
            return res.redirect(frontendLink.toString());
        }
        res.redirect(process.env.Frontend_Link);
        const resJson = yield resStore.json();
        if (resStore.ok) {
            // console.log(resJson);
            // console.log(resJson);
            // console.log(resJson);
            return res.status(200).json(resJson);
        }
    }
    return res.status(400).json("error");
}));
exports.getUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(req.params.id).populate({
        path: "subscription",
        select: "plan start_date expiry_date orders_limit products_limit",
        populate: {
            path: "plan",
            select: "name orders_limit products_limit",
        },
    });
    if (!user)
        return next(new appError_1.default("User not found", 401));
    let userJSON = user.toJSON();
    userJSON.planName = userJSON.subscription.plan.name;
    userJSON.subscriptionStart = userJSON.subscription.start_date;
    userJSON.subscriptionExpiry = userJSON.subscription.expiry_date;
    userJSON.subscriptionOrdersLimit = userJSON.subscription.orders_limit;
    userJSON.subscriptionProductsLimit = userJSON.subscription.products_limit;
    userJSON.id = userJSON._id.toString();
    userJSON.totalOrdersLimit = userJSON.subscription.plan.orders_limit;
    userJSON.totalProductsLimit = userJSON.subscription.plan.products_limit;
    return res.status(200).json({ user: userJSON });
}));
