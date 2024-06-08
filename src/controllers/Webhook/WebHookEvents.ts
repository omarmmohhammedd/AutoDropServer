import SendEmail from "../../features/email/send";
import { GenerateRandom, HashPassword } from "./handlers/generator";
import User from "../../models/user.model";
import { messages, NewAccountKeys } from "./handlers/data/messages";
import { Request, Response, NextFunction } from "express";
import { map, pick } from "lodash";
import generateOptions from "./handlers/generateOptions";
import {
  ImageType,
  OptionType,
  Product,
  ProductDocument,
  ValueType,
} from "../../models/product.model";
import { Order } from "../../models/Order.model";
import { Plan } from "../../models/Plan.model";
import {
  Subscription,
  SubscriptionDocument,
} from "../../models/Subscription.model";
import moment from "moment";
import { Transaction } from "../../models/Transaction.model";
import axios from "axios";
import SallaRequest from "../../utils/handlers/SallaRequest";
import AppError from "../../utils/appError";
import { UpdateOrderTracking } from "./handlers/order";
import { CheckTokenExpire } from "./handlers/data/authHandler";
import { GenerateToken } from "./handlers/token";
import { sendSubscription } from "./utils/sendSubscription";
import { WebSocketSendError, WebSocketSender } from "../../utils/handlers/WebSocketSender";
import { CheckSubscription } from "../../utils/handlers/CheckSubscription";
import { use } from "passport";
import SallaToken from "../../models/SallaTokenModel";

export default class WebHookEvents {
  async CreateNewApp(body: any, res: Response, next: NextFunction) {
    console.log("body",body)
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
  }

  async AuthorizeEvent(body: any, res: Response, next: NextFunction) {
    try {
      let password: string, hashed: string, token: string | undefined;
      const { merchant, data } = pick(body, ["merchant", "data"]);

      const account = await User.findOne({
        merchantId: merchant,
        tokens: {
          $eq: null,
        },
      }).exec();

      if (!account) return res.sendStatus(404);

      const { data: info } = await this.GetUserInfo(data.access_token);

      const { data: userInfo } = info;

      password = GenerateRandom(16);
      hashed = HashPassword(password);

      token = GenerateToken({
        merchant,
        token: JSON.stringify(data),
      });
      let checkEmail = async function (result: any) {
        function isValidEmail(email: string) {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (emailRegex.test(email)) {
            return email;
          } else return false;
        }

        const clientEmail = isValidEmail(userInfo.email);
        if (clientEmail) {
          // send email to new partner with email and new password
          const options = generateOptions<NewAccountKeys>(
            clientEmail,
            // "frontdev0219@gmail.com",
            // process.env.EMAIL_USERNAME,
            messages["new-account"],
            {
              "{{_EMAIL_}}": clientEmail,
              "{{_NAME_}}": userInfo?.name,
              "{{_PASSWORD_}}": password,
            }
          );
          await SendEmail(options);
        }
      };
      let userDoc = User.findOneAndUpdate(
        {
          merchantId: merchant,
          tokens: {
            $eq: null,
          },
        },
        {
          password: hashed,
          name: userInfo?.name,
          email: userInfo?.email,
          mobile: userInfo?.mobile,
          userInfo: JSON.stringify(userInfo?.merchant),
          avatar: userInfo?.merchant?.avatar,
          website: userInfo?.merchant?.domain,
          tokens: JSON.stringify(data),
        },
        { new: true }
      );
      checkEmail(userDoc);
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async RemoveApp(body: any, res: Response, next: NextFunction) {
    try {
      console.log("REMOVE APP EVENT TRIGGERED",body)
      const { merchant } = pick(body, ["merchant"]);
      const user = await User.findOne({ merchantID: merchant });
      if(user){

        user.merchantID = undefined;
  user.storeName = undefined;
  user.storeLink = undefined;
      }
      if (!user) throw new AppError("User Not Found", 404);
      await Subscription.deleteMany({ user: user.id });
      await SallaToken.deleteMany({ userId: user.id });
      res.sendStatus(200);
      WebSocketSendError('resetSalla',user.id)
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
    } catch (error) {
      next(error);
    }
  }

  GetUserInfo(token: string): Promise<any> {
    return SallaRequest({ url: "oauth2/user/info", method: "get", token });
  }

  async DeleteSelectedProduct(body: any, res: Response, next: NextFunction) {
    try {
      const { id } = pick(body.data, ["id"]);
      await Product.findOneAndDelete({
        salla_product_id: id,
      }).then(() => res.sendStatus(200));
    } catch (error) {
      next(error);
    }
  }

  async DeleteSelectedOrder(body: any, res: Response, next: NextFunction) {
    try {
      const { id } = pick(body.data, ["id"]);
      await Order.findOneAndDelete(
        {
          order_id: id,
        },
        {}
        /*         ,
        function (err: any, result: any) {
          if (err) console.log(err);
        } */
      );
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  async CreateNewOrder(body: any, res: Response, next: NextFunction) {
    try {
      let total: number = 0,
        sub_total: number = 0,
        commission: number = 0,
        meta: any = {};
      const { data: orderData } = pick(body, ["data"]);
      const data = pick(orderData, [
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
      const orderExisted = await Order.findOne({ order_id: data.id }).exec();

      if (orderExisted) return res.sendStatus(409);

      const itemIds = map(data.items, "product.id");

      const products: any[] | null = await Product.find({
        salla_product_id: {
          $in: itemIds,
        },
      })
        .select(
          "name salla_product_id price main_price vendor_commission vendor_price merchant sku options variantsArr shipping shippingIncludedChoice shippingFee"
        )
        .exec();

      if (!(products as any[])?.length) return res.sendStatus(409);

      const findProductIds = map(products, "salla_product_id");
      const filterItems = data.items?.filter((obj: any) => {
        return findProductIds.includes(obj?.product?.id?.toString());
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
      const mapItems = await Promise.all(
        filterItems.map((item: any, i: number) => {
          const productId = item?.product?.id;
          const product: any = products.find(
            (ev: ProductDocument) => ev.salla_product_id == productId
          );
          const jsonProduct = product.toJSON();

          //
          let optionsIds = item.options?.map(
            (option: any, optIndex: number) => {
              let id = option.value.id;
              return id;
            }
          );
          console.log("optionsIds", optionsIds);
          let { variantsArr } = product;
          let choosenVariant = variantsArr?.find((variant: any) => {
            let valid = true;
            optionsIds.forEach((id: number) => {
              if (!variant.sallaValues.includes(id)) {
                valid = false;
              }
            });
            return valid;
          });
          console.log("choosenVariant", choosenVariant);

          if (choosenVariant) {
            let { offer_sale_price, commission, profitTypeValue } =
              choosenVariant;
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
            } else {
              displayedPrice = offer_sale_price + commission;
            }
            if (product?.shippingIncludedChoice) {
              console.log("displayedPrice before shipping + ", displayedPrice);
              displayedPrice += product.shippingFee;
              console.log("displayedPrice after shipping + ", displayedPrice);
            }

            const OrderValue = {
              price: {
                amount: displayedPrice || product.main_price,
              },
            };
            choosenVariant = Object.assign(
              {},
              choosenVariant,
              OrderValue,
              originalPriceVariant
            );
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
          const options = item.options?.map((option: any, idx: number) => {
            const productOption = jsonProduct.options[idx]?.values;
            const variant = productOption.find(
              (pd: any) => pd.salla_value_id == option.value.id
            );
            const value = {
              price: {
                amount: variant.original_price || product.main_price,
              },
            };

            const result = {
              ...option,
              value: Object.assign({}, option?.value || {}, value),
            };

            return result;
          });

          sub_total += options[0]?.value.price.amount || product.main_price;
          meta[productId] = {
            vendor_commission: product?.vendor_commission,
            vendor_price: product?.vendor_price,
          };
          return {
            sku: item?.sku,
            quantity: item?.quantity,
            thumbnail: item?.product?.thumbnail,
            product: {
              ...product,
            },
            options,
            choosenVariant,
          };
        })
      );
      // commission = Math.ceil((+sub_total * +(APP_COMMISSION as string)) / 100);
      // total = +sub_total + commission;
      total = +sub_total;
      const merchant = products?.[0]?.merchant;
      let storeName = "";
      try {
        let OrderUser = await User.findById(merchant).select("storeName -_id");
        storeName = OrderUser?.storeName ?? "";
      } catch (err: any) {
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
      const subscription = await CheckSubscription(merchant, "orders_limit");

      if (subscription && subscription.orders_limit)
        subscription.orders_limit = subscription.orders_limit - 1;

      const order = new Order({
        ...data,
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
        merchant,
        order_id: data.id,
        items: mapItems,
        status: "created",
        status_track: [],
        // totalPrice,
        storeName,
      });
      console.log("order", order);
      const status_track = UpdateOrderTracking("created", order);
      order.status_track = status_track;
await order.save(),

      subscription?.save().then(updatedSubscription => {
        if(updatedSubscription)
          WebSocketSender(updatedSubscription);
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
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async UpdateOrderStatus(body: any, res: Response, next: NextFunction) {
    try {
      const { id } = pick(body.data, ["id"]);
      const order = await Order.findOne({ order_id: id }).exec();

      if (!order) {
        console.log("selected order is invalid!");
        return res.status(404).send("order not found");
      }

      // next();
    } catch (error) {
      return res.status(404).json({ error });
    }
  }

  async makeSubscription(
    body: any,
    res: Response,
    next: NextFunction,
    clients: any,
    WebSocket: any
  ) {
    try {
      console.log("subscription started");

      const user = await User.findOne({ merchantID: body.merchant });
      // const plan = await Plan.findOne({ name: body.data.plan_name });
      const plan = await Plan.findOne({ price: body.data.price });
      if (!user) return res.status(404).send("User Not Found");
      if (!plan) return res.status(404).send("Plan Not Found");
      await Subscription.deleteMany({ user: user.id });
      const currentDate = moment().toDate();
      const nextPayment = moment()
        .add(1, plan.is_monthly ? "month" : "year")
        .toDate();

      const subscription = new Subscription({
        start_date: currentDate,
        expiry_date: nextPayment,
        plan: plan.id,
        user: user.id,
        orders_limit: plan.orders_limit,
        products_limit: plan.products_limit,
      });
      const transaction = new Transaction({
        status: "CAPTURED",
        tranRef: body.data.id,
        plan: plan.id,
        amount: body.data.total,
        user: user?.id,
      });
      console.log("subscription completed");
      console.log("subscription", subscription);
      user.subscription = subscription._id;
      subscription?.save().then(updatedSubscription => {
        if(updatedSubscription)
          WebSocketSender(updatedSubscription);
      }).catch(err => {
        // handle error
        console.error(err);
      });
      await Promise.all([
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
      } catch (err: any) {
        console.error(err);
        console.error("failed to send subscription to frontend");
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async freeTrial(body: any, res: Response) {
    try {
      const user = await User.findOne({ merchantId: body.merchant });
      if (!user) return res.status(404).send("User Not Found");
      const existsSub = await Subscription.findOne({ user: user.id });
      if (existsSub) return res.sendStatus(409);
      const plan = await Plan.findOne({ is_default: true }).exec();
      if (plan) {
        const currentDate = moment().toDate();
        const nextPayment = moment().add(7, "days").toDate();
        await Subscription.create({
          plan: plan?.id,
          orders_limit: plan?.orders_limit,
          products_limit: plan?.products_limit,
          start_date: currentDate,
          expiry_date: nextPayment,
          user: user.id,
        });
      }
      return res.sendStatus(201);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteFree(body: any, res: Response) {
    try {
      const user = await User.findOne({ merchantId: body.merchant });
      if (!user) return res.status(404).send("User Not Found");
      const plan = await Plan.findOne({ is_default: true }).exec();
      const existsSub = await Subscription.findOne({
        user: user.id,
        plan: plan?.id,
      });
      if (!existsSub) return res.status(404).send("Free Trial Not Found");
      await Subscription.deleteOne({ user: user.id, plan: plan?.id });
      return res.sendStatus(200);
    } catch (error: any) {
      return res.status(500).json({ error: error?.message });
    }
  }

  async deletePlan(body: any, res: Response) {
    try {
      const user = await User.findOne({ merchantId: body.merchant });
      const plan = await Plan.findOne({ name: body.data.plan_name });
      if (!user) return res.status(404).send("User Not Found");
      if (!plan) return res.status(404).send("Plan Not Found");
      const existsSub = await Subscription.findOne({
        user: user.id,
        plan: plan.id,
      });
      if (!existsSub) return res.status(404).send("Subscription Not Found");
      await Subscription.deleteOne({ user: user.id, plan: plan.id });
      return res.sendStatus(200);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateProduct(body: any, res: Response) {
    try {
      const updateVariantPrice = async (
        id: any,
        access_token: any,
        price: number
      ) => {
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
          const { data } = await axios.request(options);
          if (data.status === 201) {
            return true;
          } else return false;
        } catch (error) {}
      };
      const product = await Product.findOne({ salla_product_id: body.data.id });
      if (!product) return res.sendStatus(404);
      else {
        const user = await User.findById(product?.merchant);
        const access_token = CheckTokenExpire(user?.tokens);
        const { name, regular_price, description, quantity, metadata } =
          body?.data;
        const images: ImageType[] = body.data.images.map(
          (img: any, index: number) => ({
            original: img.url,
            thumbnail: img.url,
            alt: "image " + index,
            default: false,
          })
        );

        const vendor_price = Number(regular_price.amount - product.main_price);
        product.vendor_commission = Number(
          (
            ((regular_price.amount - product.main_price) / product.main_price) *
            100
          ).toFixed(2)
        );
        product.vendor_price = vendor_price;
        product.name = name;
        product.price = regular_price.amount;
        product.description = description;
        product.quantity = quantity;
        product.images = images;
        product.metadata_title = metadata.title;
        product.metadata_description = metadata.metadata_description;
        const jsonProduct = product.toJSON();
        product.options = await Promise.all(
          //@ts-ignore
          jsonProduct?.options?.map(async (option: OptionType) => {
            option.values = await Promise.all(
              option.values.map(async (val: ValueType) => {
                if (val?.salla_variant_id) {
                  const varId = val.salla_variant_id;
                  const valuePrice = val.original_price;
                  const vendorOptionPrice = parseFloat(
                    (
                      valuePrice +
                      (valuePrice * product.vendor_commission) / 100
                    ).toFixed(2)
                  );

                  // let updater = await updateVariantPrice(varId, access_token, vendorOptionPrice);

                  // if (!updater) {
                  //   updater = await updateVariantPrice(varId, access_token, vendorOptionPrice);
                  // }

                  return {
                    ...val,
                    price: vendorOptionPrice,
                  };
                } else {
                  return val;
                }
              })
            );

            return option;
          })
        );

        await product.save().then(() => res.sendStatus(201));
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
}
