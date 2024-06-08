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
const send_1 = __importDefault(require("../../features/email/send"));
const generator_1 = require("./handlers/generator");
const user_model_1 = __importDefault(require("../../models/user.model"));
const messages_1 = require("./handlers/data/messages");
const lodash_1 = require("lodash");
const generateOptions_1 = __importDefault(require("./handlers/generateOptions"));
const product_model_1 = require("../../models/product.model");
const Order_model_1 = require("../../models/Order.model");
const Plan_model_1 = require("../../models/Plan.model");
const Subscription_model_1 = require("../../models/Subscription.model");
const moment_1 = __importDefault(require("moment"));
const Transaction_model_1 = require("../../models/Transaction.model");
const axios_1 = __importDefault(require("axios"));
const SallaRequest_1 = __importDefault(require("../../utils/handlers/SallaRequest"));
const appError_1 = __importDefault(require("../../utils/appError"));
const order_1 = require("./handlers/order");
const authHandler_1 = require("./handlers/data/authHandler");
const token_1 = require("./handlers/token");
const WebSocketSender_1 = require("../../utils/handlers/WebSocketSender");
const CheckSubscription_1 = require("../../utils/handlers/CheckSubscription");
const SallaTokenModel_1 = __importDefault(require("../../models/SallaTokenModel"));
class WebHookEvents {
    CreateNewApp(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("body", body);
            return res.sendStatus(201);
            /*     try {
                  return
                  const { merchant, data } = pick(body, ["merchant", "data"]);
            
                  const existed = await User.findOne({ merchantId: merchant }).exec();
            
                  if (existed) return res.sendStatus(409);
            
                  const user = new User({
                    name: data.app_name,
                    merchantId: merchant,
                    meta: JSON.stringify(data),
                    storeName: data.app_name,
                    userType: "vendor",
                  });
                  await user.save();
            
                  /*   user.save(function (err: any, result: any) {
                    if (err) return console.log(err);
                    res.sendStatus(201)
                  }); */
            // return res.sendStatus(201);
            // } catch (error) {
            // console.log(error);
            // return res.sendStatus(500);
            // } */
        });
    }
    AuthorizeEvent(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                let password, hashed, token;
                const { merchant, data } = (0, lodash_1.pick)(body, ["merchant", "data"]);
                const account = yield user_model_1.default.findOne({
                    merchantId: merchant,
                    tokens: {
                        $eq: null,
                    },
                }).exec();
                if (!account)
                    return res.sendStatus(404);
                const { data: info } = yield this.GetUserInfo(data.access_token);
                const { data: userInfo } = info;
                password = (0, generator_1.GenerateRandom)(16);
                hashed = (0, generator_1.HashPassword)(password);
                token = (0, token_1.GenerateToken)({
                    merchant,
                    token: JSON.stringify(data),
                });
                let checkEmail = function (result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        function isValidEmail(email) {
                            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                            if (emailRegex.test(email)) {
                                return email;
                            }
                            else
                                return false;
                        }
                        const clientEmail = isValidEmail(userInfo.email);
                        if (clientEmail) {
                            // send email to new partner with email and new password
                            const options = (0, generateOptions_1.default)(clientEmail, 
                            // "frontdev0219@gmail.com",
                            // process.env.EMAIL_USERNAME,
                            messages_1.messages["new-account"], {
                                "{{_EMAIL_}}": clientEmail,
                                "{{_NAME_}}": userInfo === null || userInfo === void 0 ? void 0 : userInfo.name,
                                "{{_PASSWORD_}}": password,
                            });
                            yield (0, send_1.default)(options);
                        }
                    });
                };
                let userDoc = user_model_1.default.findOneAndUpdate({
                    merchantId: merchant,
                    tokens: {
                        $eq: null,
                    },
                }, {
                    password: hashed,
                    name: userInfo === null || userInfo === void 0 ? void 0 : userInfo.name,
                    email: userInfo === null || userInfo === void 0 ? void 0 : userInfo.email,
                    mobile: userInfo === null || userInfo === void 0 ? void 0 : userInfo.mobile,
                    userInfo: JSON.stringify(userInfo === null || userInfo === void 0 ? void 0 : userInfo.merchant),
                    avatar: (_a = userInfo === null || userInfo === void 0 ? void 0 : userInfo.merchant) === null || _a === void 0 ? void 0 : _a.avatar,
                    website: (_b = userInfo === null || userInfo === void 0 ? void 0 : userInfo.merchant) === null || _b === void 0 ? void 0 : _b.domain,
                    tokens: JSON.stringify(data),
                }, { new: true });
                checkEmail(userDoc);
                res.sendStatus(200);
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    RemoveApp(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("REMOVE APP EVENT TRIGGERED", body);
                const { merchant } = (0, lodash_1.pick)(body, ["merchant"]);
                const user = yield user_model_1.default.findOne({ merchantID: merchant });
                if (user) {
                    user.merchantID = undefined;
                    user.storeName = undefined;
                    user.storeLink = undefined;
                }
                if (!user)
                    throw new appError_1.default("User Not Found", 404);
                yield Subscription_model_1.Subscription.deleteMany({ user: user.id });
                yield SallaTokenModel_1.default.deleteMany({ userId: user.id });
                res.sendStatus(200);
                (0, WebSocketSender_1.WebSocketSendError)('resetSalla', user.id);
                // User.findOneAndDelete(
                //   {
                //     merchantId: merchant,
                //   },
                //   {},
                //   function (err: any, result: any) {
                //     if (err) {
                //       console.log(err);
                //       return;
                //     }
                //     console.log("uninstall app: ", result);
                //   }
                // );
            }
            catch (error) {
                next(error);
            }
        });
    }
    GetUserInfo(token) {
        return (0, SallaRequest_1.default)({ url: "oauth2/user/info", method: "get", token });
    }
    DeleteSelectedProduct(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = (0, lodash_1.pick)(body.data, ["id"]);
                yield product_model_1.Product.findOneAndDelete({
                    salla_product_id: id,
                }).then(() => res.sendStatus(200));
            }
            catch (error) {
                next(error);
            }
        });
    }
    DeleteSelectedOrder(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = (0, lodash_1.pick)(body.data, ["id"]);
                yield Order_model_1.Order.findOneAndDelete({
                    order_id: id,
                }, {}
                /*         ,
                function (err: any, result: any) {
                  if (err) console.log(err);
                } */
                );
                res.sendStatus(200);
            }
            catch (error) {
                next(error);
            }
        });
    }
    CreateNewOrder(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                let total = 0, sub_total = 0, commission = 0, meta = {};
                const { data: orderData } = (0, lodash_1.pick)(body, ["data"]);
                const data = (0, lodash_1.pick)(orderData, [
                    "payment_method",
                    "id",
                    "order_id",
                    "reference_id",
                    "items",
                    "shipping",
                    "customer",
                    "status",
                    "amounts",
                ]);
                // console.log(data.items[0])
                const orderExisted = yield Order_model_1.Order.findOne({ order_id: data.id }).exec();
                if (orderExisted)
                    return res.sendStatus(409);
                const itemIds = (0, lodash_1.map)(data.items, "product.id");
                const products = yield product_model_1.Product.find({
                    salla_product_id: {
                        $in: itemIds,
                    },
                })
                    .select("name salla_product_id price main_price vendor_commission vendor_price merchant sku options variantsArr shipping shippingIncludedChoice shippingFee")
                    .exec();
                if (!(products === null || products === void 0 ? void 0 : products.length))
                    return res.sendStatus(409);
                const findProductIds = (0, lodash_1.map)(products, "salla_product_id");
                const filterItems = (_a = data.items) === null || _a === void 0 ? void 0 : _a.filter((obj) => {
                    var _a, _b;
                    return findProductIds.includes((_b = (_a = obj === null || obj === void 0 ? void 0 : obj.product) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString());
                });
                /*     const orderItemsSallaValueIds = filterItems.map(
                  (item: any, index: number) => {
                    let options = item.options.map((option: any, optIndex: number) => {
                      let id = option.value.id;
                      return id;
                    });
                    return options;
                  }
                ); */
                // let totalPrice = 0;
                const mapItems = yield Promise.all(filterItems.map((item, i) => {
                    var _a, _b, _c, _d, _e;
                    const productId = (_a = item === null || item === void 0 ? void 0 : item.product) === null || _a === void 0 ? void 0 : _a.id;
                    const product = products.find((ev) => ev.salla_product_id == productId);
                    const jsonProduct = product.toJSON();
                    //
                    let optionsIds = (_b = item.options) === null || _b === void 0 ? void 0 : _b.map((option, optIndex) => {
                        let id = option.value.id;
                        return id;
                    });
                    console.log("optionsIds", optionsIds);
                    let { variantsArr } = product;
                    let choosenVariant = variantsArr === null || variantsArr === void 0 ? void 0 : variantsArr.find((variant) => {
                        let valid = true;
                        optionsIds.forEach((id) => {
                            if (!variant.sallaValues.includes(id)) {
                                valid = false;
                            }
                        });
                        return valid;
                    });
                    console.log("choosenVariant", choosenVariant);
                    if (choosenVariant) {
                        let { offer_sale_price, commission, profitTypeValue } = choosenVariant;
                        offer_sale_price = Number(offer_sale_price);
                        let originalPriceVariant = offer_sale_price;
                        let displayedPrice = 0;
                        if (commission == 0) {
                            // get the commission from the product itself
                            commission = product.vendor_commission;
                        }
                        if (profitTypeValue === "percentage") {
                            displayedPrice =
                                offer_sale_price + (offer_sale_price * commission) / 100;
                        }
                        else {
                            displayedPrice = offer_sale_price + commission;
                        }
                        if (product === null || product === void 0 ? void 0 : product.shippingIncludedChoice) {
                            console.log("displayedPrice before shipping + ", displayedPrice);
                            displayedPrice += product.shippingFee;
                            console.log("displayedPrice after shipping + ", displayedPrice);
                        }
                        const OrderValue = {
                            price: {
                                amount: displayedPrice || product.main_price,
                            },
                        };
                        choosenVariant = Object.assign({}, choosenVariant, OrderValue, originalPriceVariant);
                        let itemQuantity = item.quantity;
                        // let displayedTotalPrice = itemQuantity * displayedPrice;
                        // totalPrice += displayedTotalPrice;
                        /*       const result = {
                          ...item.options[0],
                          value: Object.assign({}, item.options[0]?.value || {}, value),
                        };
                        item.options[0] = result; */
                    }
                    //
                    const options = (_c = item.options) === null || _c === void 0 ? void 0 : _c.map((option, idx) => {
                        var _a;
                        const productOption = (_a = jsonProduct.options[idx]) === null || _a === void 0 ? void 0 : _a.values;
                        const variant = productOption.find((pd) => pd.salla_value_id == option.value.id);
                        const value = {
                            price: {
                                amount: variant.original_price || product.main_price,
                            },
                        };
                        const result = Object.assign(Object.assign({}, option), { value: Object.assign({}, (option === null || option === void 0 ? void 0 : option.value) || {}, value) });
                        return result;
                    });
                    sub_total += ((_d = options[0]) === null || _d === void 0 ? void 0 : _d.value.price.amount) || product.main_price;
                    meta[productId] = {
                        vendor_commission: product === null || product === void 0 ? void 0 : product.vendor_commission,
                        vendor_price: product === null || product === void 0 ? void 0 : product.vendor_price,
                    };
                    return {
                        sku: item === null || item === void 0 ? void 0 : item.sku,
                        quantity: item === null || item === void 0 ? void 0 : item.quantity,
                        thumbnail: (_e = item === null || item === void 0 ? void 0 : item.product) === null || _e === void 0 ? void 0 : _e.thumbnail,
                        product: Object.assign({}, product),
                        options,
                        choosenVariant,
                    };
                }));
                // commission = Math.ceil((+sub_total * +(APP_COMMISSION as string)) / 100);
                // total = +sub_total + commission;
                total = +sub_total;
                const merchant = (_b = products === null || products === void 0 ? void 0 : products[0]) === null || _b === void 0 ? void 0 : _b.merchant;
                let storeName = "";
                try {
                    let OrderUser = yield user_model_1.default.findById(merchant).select("storeName -_id");
                    storeName = (_c = OrderUser === null || OrderUser === void 0 ? void 0 : OrderUser.storeName) !== null && _c !== void 0 ? _c : "";
                }
                catch (err) {
                    console.error(err);
                }
                /*
                const subscription: SubscriptionDocument | null = await CheckSubscription(
                  merchant,
                  "orders_limit"
                );
          
                if (subscription && subscription.orders_limit)
                  subscription.orders_limit = subscription.orders_limit - 1;
           */
                const subscription = yield (0, CheckSubscription_1.CheckSubscription)(merchant, "orders_limit");
                if (subscription && subscription.orders_limit)
                    subscription.orders_limit = subscription.orders_limit - 1;
                const order = new Order_model_1.Order(Object.assign(Object.assign({}, data), { 
                    /*         amounts: {
                      total: {
                        amount: total,
                      },
                      app_commission: {
                        amount: commission,
                        percentage: parseInt(APP_COMMISSION as string, 10) || 0,
                      },
                    }, */
                    meta,
                    merchant, order_id: data.id, items: mapItems, status: "created", status_track: [], 
                    // totalPrice,
                    storeName }));
                console.log("order", order);
                const status_track = (0, order_1.UpdateOrderTracking)("created", order);
                order.status_track = status_track;
                yield order.save(),
                    subscription === null || subscription === void 0 ? void 0 : subscription.save().then(updatedSubscription => {
                        if (updatedSubscription)
                            (0, WebSocketSender_1.WebSocketSender)(updatedSubscription);
                    }).catch(err => {
                        // handle error
                        console.error(err);
                    });
                // await Promise.all([
                // subscription?.save(),
                /*    order.save(function (err, result) {
                  if (err) return console.log(err);
                }), */
                // order.save(),
                // ]);
                return res.status(200).send("order stored");
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    UpdateOrderStatus(body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = (0, lodash_1.pick)(body.data, ["id"]);
                const order = yield Order_model_1.Order.findOne({ order_id: id }).exec();
                if (!order) {
                    console.log("selected order is invalid!");
                    return res.status(404).send("order not found");
                }
                // next();
            }
            catch (error) {
                return res.status(404).json({ error });
            }
        });
    }
    makeSubscription(body, res, next, clients, WebSocket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("subscription started");
                const user = yield user_model_1.default.findOne({ merchantID: body.merchant });
                // const plan = await Plan.findOne({ name: body.data.plan_name });
                const plan = yield Plan_model_1.Plan.findOne({ price: body.data.price });
                if (!user)
                    return res.status(404).send("User Not Found");
                if (!plan)
                    return res.status(404).send("Plan Not Found");
                yield Subscription_model_1.Subscription.deleteMany({ user: user.id });
                const currentDate = (0, moment_1.default)().toDate();
                const nextPayment = (0, moment_1.default)()
                    .add(1, plan.is_monthly ? "month" : "year")
                    .toDate();
                const subscription = new Subscription_model_1.Subscription({
                    start_date: currentDate,
                    expiry_date: nextPayment,
                    plan: plan.id,
                    user: user.id,
                    orders_limit: plan.orders_limit,
                    products_limit: plan.products_limit,
                });
                const transaction = new Transaction_model_1.Transaction({
                    status: "CAPTURED",
                    tranRef: body.data.id,
                    plan: plan.id,
                    amount: body.data.total,
                    user: user === null || user === void 0 ? void 0 : user.id,
                });
                console.log("subscription completed");
                console.log("subscription", subscription);
                user.subscription = subscription._id;
                subscription === null || subscription === void 0 ? void 0 : subscription.save().then(updatedSubscription => {
                    if (updatedSubscription)
                        (0, WebSocketSender_1.WebSocketSender)(updatedSubscription);
                }).catch(err => {
                    // handle error
                    console.error(err);
                });
                yield Promise.all([
                    transaction.save(),
                    // subscription.save(),
                    user.save(),
                ]).then(() => {
                    // WebSocketSender(subscription);
                    res.status(201).send("subscription saved");
                });
                try {
                    // WebSocketSender(subscription);
                    /* sendSubscription(subscription,plan,user.id,clients,WebSocket) */
                }
                catch (err) {
                    console.error(err);
                    console.error("failed to send subscription to frontend");
                }
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    }
    freeTrial(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({ merchantId: body.merchant });
                if (!user)
                    return res.status(404).send("User Not Found");
                const existsSub = yield Subscription_model_1.Subscription.findOne({ user: user.id });
                if (existsSub)
                    return res.sendStatus(409);
                const plan = yield Plan_model_1.Plan.findOne({ is_default: true }).exec();
                if (plan) {
                    const currentDate = (0, moment_1.default)().toDate();
                    const nextPayment = (0, moment_1.default)().add(7, "days").toDate();
                    yield Subscription_model_1.Subscription.create({
                        plan: plan === null || plan === void 0 ? void 0 : plan.id,
                        orders_limit: plan === null || plan === void 0 ? void 0 : plan.orders_limit,
                        products_limit: plan === null || plan === void 0 ? void 0 : plan.products_limit,
                        start_date: currentDate,
                        expiry_date: nextPayment,
                        user: user.id,
                    });
                }
                return res.sendStatus(201);
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    }
    deleteFree(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({ merchantId: body.merchant });
                if (!user)
                    return res.status(404).send("User Not Found");
                const plan = yield Plan_model_1.Plan.findOne({ is_default: true }).exec();
                const existsSub = yield Subscription_model_1.Subscription.findOne({
                    user: user.id,
                    plan: plan === null || plan === void 0 ? void 0 : plan.id,
                });
                if (!existsSub)
                    return res.status(404).send("Free Trial Not Found");
                yield Subscription_model_1.Subscription.deleteOne({ user: user.id, plan: plan === null || plan === void 0 ? void 0 : plan.id });
                return res.sendStatus(200);
            }
            catch (error) {
                return res.status(500).json({ error: error === null || error === void 0 ? void 0 : error.message });
            }
        });
    }
    deletePlan(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({ merchantId: body.merchant });
                const plan = yield Plan_model_1.Plan.findOne({ name: body.data.plan_name });
                if (!user)
                    return res.status(404).send("User Not Found");
                if (!plan)
                    return res.status(404).send("Plan Not Found");
                const existsSub = yield Subscription_model_1.Subscription.findOne({
                    user: user.id,
                    plan: plan.id,
                });
                if (!existsSub)
                    return res.status(404).send("Subscription Not Found");
                yield Subscription_model_1.Subscription.deleteOne({ user: user.id, plan: plan.id });
                return res.sendStatus(200);
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    }
    updateProduct(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const updateVariantPrice = (id, access_token, price) => __awaiter(this, void 0, void 0, function* () {
                    const options = {
                        method: "PUT",
                        url: `https://api.salla.dev/admin/v2/products/variants/${id}`,
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${access_token}`,
                        },
                        data: {
                            price,
                        },
                    };
                    try {
                        const { data } = yield axios_1.default.request(options);
                        if (data.status === 201) {
                            return true;
                        }
                        else
                            return false;
                    }
                    catch (error) { }
                });
                const product = yield product_model_1.Product.findOne({ salla_product_id: body.data.id });
                if (!product)
                    return res.sendStatus(404);
                else {
                    const user = yield user_model_1.default.findById(product === null || product === void 0 ? void 0 : product.merchant);
                    const access_token = (0, authHandler_1.CheckTokenExpire)(user === null || user === void 0 ? void 0 : user.tokens);
                    const { name, regular_price, description, quantity, metadata } = body === null || body === void 0 ? void 0 : body.data;
                    const images = body.data.images.map((img, index) => ({
                        original: img.url,
                        thumbnail: img.url,
                        alt: "image " + index,
                        default: false,
                    }));
                    const vendor_price = Number(regular_price.amount - product.main_price);
                    product.vendor_commission = Number((((regular_price.amount - product.main_price) / product.main_price) *
                        100).toFixed(2));
                    product.vendor_price = vendor_price;
                    product.name = name;
                    product.price = regular_price.amount;
                    product.description = description;
                    product.quantity = quantity;
                    product.images = images;
                    product.metadata_title = metadata.title;
                    product.metadata_description = metadata.metadata_description;
                    const jsonProduct = product.toJSON();
                    product.options = yield Promise.all(
                    //@ts-ignore
                    (_a = jsonProduct === null || jsonProduct === void 0 ? void 0 : jsonProduct.options) === null || _a === void 0 ? void 0 : _a.map((option) => __awaiter(this, void 0, void 0, function* () {
                        option.values = yield Promise.all(option.values.map((val) => __awaiter(this, void 0, void 0, function* () {
                            if (val === null || val === void 0 ? void 0 : val.salla_variant_id) {
                                const varId = val.salla_variant_id;
                                const valuePrice = val.original_price;
                                const vendorOptionPrice = parseFloat((valuePrice +
                                    (valuePrice * product.vendor_commission) / 100).toFixed(2));
                                // let updater = await updateVariantPrice(varId, access_token, vendorOptionPrice);
                                // if (!updater) {
                                //   updater = await updateVariantPrice(varId, access_token, vendorOptionPrice);
                                // }
                                return Object.assign(Object.assign({}, val), { price: vendorOptionPrice });
                            }
                            else {
                                return val;
                            }
                        })));
                        return option;
                    })));
                    yield product.save().then(() => res.sendStatus(201));
                }
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
        });
    }
}
exports.default = WebHookEvents;
