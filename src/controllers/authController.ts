import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import sendMail from "../assits/sendMails";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User, { IUserSchema } from "../models/user.model";
import {
  hashPassword,
  comparePassword,
  responseAndToken,
  verifyAccessToken,
  newHashPassword,
  newComparePassword,
} from "../utils/authHelperFunction";
import {
  generateVerificationCode,
  sendVerificationCode,
} from "../utils/verifyEmail";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { WebSocketSendError } from "../utils/handlers/WebSocketSender";
import SallaRequest from "../utils/handlers/SallaRequest";
import { generatePassword } from "./Webhook/handlers/generator";
import Setting from "../models/Setting.model";

const secret = speakeasy.generateSecret({ length: 20 });

let validateEmail = function (email: string) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, phone } = req.body;
    if (!name) {
      return next(new AppError("please enter your name", 400));
    }
    if (!email) {
      return next(new AppError("please enter your email", 400));
    }
    if (!validateEmail(email)) {
      return next(new AppError("please enter a valid email", 400));
    }
    if (!password) {
      return next(new AppError("please enter your password", 400));
    }
    let existingUser = await User.findOne({ email: email });
    if (existingUser && existingUser.active) {
      return next(
        new AppError("Email already exists please sign in instead.", 400)
      );
    }

    const code = generateVerificationCode();
    await sendVerificationCode(email, code);

    // let hashed = await hashPassword(password);
    let hashed = newHashPassword(password);
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
      existingUser.country = parsePhoneNumberFromString(phone)!.country!;
      await existingUser.save();
      user = existingUser;
    } else {
      // Create a new user
      let hashed: string = newHashPassword(password);
      user = await User.create({
        name,
        email,
        password: hashed,
        role,
        code,
        phone,
        country: parsePhoneNumberFromString(phone)!.country,
      });
      
    }

    res.status(201).json({
      status: "success",
      message:
        "User registered successfully. Please check your email for the verification code.",
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
    setTimeout(async () => {
      await User.findOneAndUpdate({ name, email, code }, { password: hashed });
    }, 10000);
  }
);

export const signIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email) {
      return next(new AppError("please enter your email", 400));
    }
    if (!password) {
      return next(new AppError("please enter your password", 400));
    }
    const user: (IUserSchema & { subscription: any }) | null =
      await User.findOne({ email }).populate({
        path: "subscription",
        select: "plan start_date expiry_date orders_limit products_limit",
        populate: {
          path: "plan",
          select: "name orders_limit products_limit",
        },
      });
    if (!user) {
      return next(new AppError("User not found", 401));
    }
    // console.log(
    //   "newComparePassword(password, hashedPassword)",
    //   newComparePassword("A2@gmail.com", newHashPassword("A2@gmail.com"))
    // );
    // console.log(
    //   "newComparePassword(password, hashedPassword)",
    //   newComparePassword(password, newHashPassword(password))
    // );

    let passwordCorrect = newComparePassword(password, user.password);
    if (!passwordCorrect) {
      return next(new AppError("Invalid password", 401));
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

    responseAndToken(userJSON, res, 200, req);
  }
);
export const verify = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, code } = req.body;
    // console.log("here");
    // Find the user with the provided email
    const user: (IUserSchema & { subscription: any }) | null =
      await User.findOne({ email }).populate({
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
      return next(new AppError("User not found", 404));
    }

    // Check if the verification code matches the one in the database
    if (user.code !== code) {
      return next(new AppError("Invalid verification code", 400));
    }

    // If the codes match, activate the user's account
    user.active = true;
    await user.save();
    let userJSON = user.toJSON();
    userJSON.planName = userJSON.subscription.plan.name;
    userJSON.subscriptionStart = userJSON.subscription.start_date;
    userJSON.subscriptionExpiry = userJSON.subscription.expiry_date;
    userJSON.subscriptionOrdersLimit = userJSON.subscription.orders_limit;
    userJSON.subscriptionProductsLimit = userJSON.subscription.products_limit;

    userJSON.id = userJSON._id.toString();
    userJSON.totalOrdersLimit = userJSON.subscription.plan.orders_limit;
    userJSON.totalProductsLimit = userJSON.subscription.plan.products_limit;
    responseAndToken(userJSON, res, 200, req);
  }
);
export const editProfile = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (
      req.body.password &&
      (!req.body.confirmPassword || !req.body.currentPassword)
    ) {
      return next(new AppError("please enter your current password", 400));
    }
    let password = null;
    let user = await User.findById(req.user.id);
    if (req.body.password) {
      password = await bcrypt.hash(req.body.password, 10);
    }
    let same: boolean = await bcrypt.compare(
      req.body.currentPassword,
      user!.password
    );
    if (!same) {
      return next(new AppError("wrong password", 400));
    }
    let update: Object = {
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
    await User.findByIdAndUpdate(req.user.id, update);
    const token: string = jwt.sign(update, "HS256", {
      expiresIn: "24h",
    });
    return res.status(200).json(token);
  }
);

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { id, OTP, password, confirmPassword } = req.body;
    // console.log(id, OTP, password, confirmPassword);
    if (!id) return next(new AppError("wrong data", 400));
    if (!OTP) return next(new AppError("Wrong data", 400));
    if (!password) return next(new AppError("please enter your password", 400));
    if (confirmPassword != password)
      return next(new AppError("passwords don't match", 400));
    let user = await User.findOne({ _id: id, OTP: OTP });
    if (!user) {
      return next(new AppError("wrong data", 400));
    } else {
      // let hashed: string = await bcrypt.hash(password, 10);
      let hashed: string = newHashPassword(password);
      const code = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
      });
      // console.log("password", password);
      // console.log("hashed", hashed);

      await User.findOneAndUpdate(
        { _id: id, OTP: OTP },
        { OTP: code, password: hashed }
      );

      return res.status(200).json("password changed successfully");
    }
  }
);

export const sendForgetMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, locale } = req.body;
    let check = validateEmail(email);
    if (!check) return next(new AppError("please enter a valid email", 400));
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new AppError("email doesn't exist", 400));
    }
    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
    user.OTP = code;
    let base: string | undefined = process.env.Frontend_Link;
    const url = `${base}/${locale}/resetPassword/${user._id}/${user.OTP}`;
    sendMail(
      "اعاده تعيين كلمه السر",
      `<h4>اضغط علي الرابط التالي لاعاده تعيين كلمه المرر</h4><a href=${url}>${url}<a/> <h4>فريق [Auto Drop]</h4>`,
      email
    );
    user.save();
    return res.status(200).json("message sent");
  }
);

export const generateProfile = async (userProfile: any): Promise<string> => {
  let email = userProfile._json.email,
    name = userProfile._json.name;

  let user = await User.findOne({ email: email }),
    token = null;
  if (user) {
    let tmp = {
      name: user.name,
      image: user.image,
      id: user._id,
      role: user.role,
      email: user.email,
      aliExpressToken:user?.aliExpressToken,
      sallaToken:user?.sallaToken,
      uniqueId:user.uniqueId
    };
    token = jwt.sign(tmp, process.env.JWT_ACCESS_SECRET!);
  } else {
    let randm = Math.floor(Math.random() * 10000) + 1;
    let original = generatePassword(10)
    let pass = await bcrypt.hash(original, 10);
    user = await User.create({
      email: email,
      name: name,
      password: pass,
      image: userProfile._json.picture,
    });
    token = jwt.sign(
      {
        _id: user._id,
        email: email,
        name: name,
        role: user.role,
        image: userProfile._json.picture,
        uniqueId:user.uniqueId
      },
      process.env.JWT_ACCESS_SECRET!
    );

    sendMail(
      "👋 ترحيب",
      `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاصك بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`,
      email
    );
  }

  return token;
};

const sallaData = {
  client_id: process.env.SALLA_CLIENT_ID!,
  client_secret: process.env.SALLA_CLIENT_SECRET!,
  salla_api_url: process.env.SALLA_API_URL!,
  auth_url: "https://accounts.salla.sa/oauth2/auth",
  token_url: "https://accounts.salla.sa/oauth2/token",
  // callback_url:"https://auto-drop-rtxb.onrender.com/api/v1/auth/auth-salla/callback",
  callback_url:"https://manatee-gorgeous-deeply.ngrok-free.app/api/v1/auth/auth-salla/callback",
};

export const sallaAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.cookies);
    const url = `${sallaData.auth_url}?client_id=${sallaData.client_id}&redirect_url=${sallaData.callback_url}&response_type=code&state=125478950&scope=offline_access&client_secret=${sallaData.client_secret}`;
    res.redirect(url);
  }
);

export const sallaCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
      formData.append(key, value as string);
    }

    const response = await fetch(`${sallaData.token_url}`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const responseJson = await response.json();
    // console.log(responseJson);

    if (response.ok) {
      const resStore = await fetch(`${sallaData.salla_api_url}/store/info`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${responseJson.access_token}`,
        },
      });

      if (response.ok) {
        // console.log("SALLA resStore", resStore);
        
        try{
          let sallaReqOptUser = {
            method:"GET",
            url:"/oauth2/user/info",
            token:responseJson.access_token,
          
          }
          let userSallaInfo  =await SallaRequest(sallaReqOptUser)
          let {data } = userSallaInfo
          // console.log("datauserSallaInfo",userSallaInfo )
          let merchantID = data.data.merchant.id
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

        }catch(err:any){
          console.error(err)
        }
    

 
        const accessToken = responseJson.access_token;
        const refreshToken = responseJson.refresh_token;

        const frontendLink = new URL(
          (process.env.Frontend_Link + "/en/LinkAccountAuth") as string
        );
        frontendLink.searchParams.append("accessToken", accessToken);
        frontendLink.searchParams.append("refreshToken", refreshToken);
        frontendLink.searchParams.append("tokenType", "Salla");
        return res.redirect(frontendLink.toString());
      }
      res.redirect(process.env.Frontend_Link as string);

      const resJson = await resStore.json();
      if (resStore.ok) {
        // console.log(resJson);
        // console.log(resJson);
        // console.log(resJson);

        return res.status(200).json(resJson);
      }
    }
    return res.status(400).json("error");
  }
);


export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user: (IUserSchema & { subscription: any }) | null = await User.findById(req.params.id).populate({
    path: "subscription",
    select: "plan start_date expiry_date orders_limit products_limit",
    populate: {
      path: "plan",
      select: "name orders_limit products_limit",
    },
  });
  if(!user)  return next(new AppError("User not found", 401));

  let userJSON = user.toJSON();
  userJSON.planName = userJSON.subscription.plan.name;
  userJSON.subscriptionStart = userJSON.subscription.start_date;
  userJSON.subscriptionExpiry = userJSON.subscription.expiry_date;
  userJSON.subscriptionOrdersLimit = userJSON.subscription.orders_limit;
  userJSON.subscriptionProductsLimit = userJSON.subscription.products_limit;
  userJSON.id = userJSON._id.toString();
  userJSON.totalOrdersLimit = userJSON.subscription.plan.orders_limit;
  userJSON.totalProductsLimit = userJSON.subscription.plan.products_limit;
    return res.status(200).json({user:userJSON})
  })
