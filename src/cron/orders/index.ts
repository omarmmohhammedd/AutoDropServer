import { schedule } from "node-cron";
import MakeRequest from "../../controllers/aliexpress/features/Request";
import User from "../../models/user.model";
import { Order, OrderDocument } from "../../models/Order.model";
import { Product } from "../../models/product.model";
// const time: string = "0 */12 * * *";

import { UpdateSalaOrderStatus } from "./handlers/UpdateSallaOrderStatus";
import ModelFactor from "./handlers/ModelFactory";
import fs from 'fs';
const time2: string = "0 * * * *";

// const time: string = "0 */1 * * *";
//                   "min hour dayOmonth monthOyear dayOweek"

const time: string = "23 */1 * * *";
export const updateOrderStatusUpdated = schedule(time, async () => {
  console.log("Cron Start To Tracking And Update Order Status ");
  try {
    let orders;
    let result;
    let paginateOptions = {
      limit: 5,
      page: 1,
    
    };
    do {
      const result = await Order.paginate(
        { tracking_order_id: { $ne: null } },
        paginateOptions
      );
      orders = result.docs;
      if (orders.length) {
        orders.forEach(async (order: any) => {
          const orderData = order.toJSON();
          console.log("orderData",orderData)
          if (orderData.tracking_order_id) {
            const body = {
              method: "aliexpress.trade.ds.order.get",
              single_order_query: JSON.stringify({
                order_id: orderData.tracking_order_id,
                // order_id: 690605028,
              }),
              sign_method: "sha256",
            };
            const user = await User.findById(order.merchant).populate([
              { path: "aliExpressToken", select: "accessToken refreshToken" },
              { path: "sallaToken", select: "accessToken refreshToken" },
            ]);
            let {aliExpressToken,sallaToken}: any = user;
            // let sallaToken: any = order.merchant.sallaToken;
            let tokenInfo = {
              aliExpressAccessToken: aliExpressToken?.accessToken,
              aliExpressRefreshToken: aliExpressToken?.refreshToken,
            };
            console.log("tokenInfo",tokenInfo)
 console.log("body",body)
 if(!tokenInfo.aliExpressAccessToken || !sallaToken?.accessToken){
return 
 }
            const { data: trackingResponse } = await MakeRequest(
              body,
              tokenInfo
            );
            const orderStatus =
              trackingResponse?.aliexpress_trade_ds_order_get_response?.result
                ?.order_status;
 console.log("orderStatus",orderStatus)
 const tokens = user?.tokens;
            fs.appendFile("orderStatusCRON.json",JSON.stringify({orderStatus},null,2), (err:any) => {console.error(err)})
            
            // const access_token = CheckTokenExpire(tokens);
            const access_token = sallaToken.accessToken;
            if (orderStatus === "PLACE_ORDER_SUCCESS") {
              await Order.findByIdAndUpdate(orderData.id, {
                status: "in_review",
              });
            } else if (orderStatus === "IN_CANCEL") {
              await UpdateSalaOrderStatus(
                "canceled",
                order.order_id,
                access_token
              ).then(
                async () =>
                  await Order.findByIdAndUpdate(orderData.id, {
                    status: "canceled",
                  })
              );
            } else if (orderStatus === "WAIT_SELLER_SEND_GOODS") {
              await UpdateSalaOrderStatus(
                "in_progress",
                order.order_id,
                access_token
              ).then(
                async () =>
                  await Order.findByIdAndUpdate(orderData.id, {
                    status: "in_progress",
                  })
              );
            } else if (orderStatus === "WAIT_BUYER_ACCEPT_GOODS") {
              await UpdateSalaOrderStatus(
                "delivering",
                order.order_id,
                access_token
              ).then(
                async () =>
                  await Order.findByIdAndUpdate(orderData.id, {
                    status: "delivering",
                  })
              );
            } else if (orderStatus === "FINISH") {
              await UpdateSalaOrderStatus(
                "delivered",
                order.order_id,
                access_token
              ).then(
                async () =>
                  await Order.findByIdAndUpdate(orderData.id, {
                    status: "completed",
                  })
              );
            } else return;
          }
          if (orderData.status === "created") {
            let x=0
            if(x){

              let total: number = 0,
                sub_total: number = 0,
                commission: number = 0,
                meta: any = {};
              const items = await Promise.all(
                orderData.items.map(async (item: any) => {
                  try {
                    const productId = item?.product?._id;
                    const product = await Product.findById(productId).select(
                      "name salla_product_id price main_price vendor_commission vendor_price merchant sku options"
                    );
                    if (product) {
                      const jsonProduct: any = product.toJSON();
                      const options = await Promise.all(
                        item.options?.map((option: any, idx: number) => {
                          const productOption =
                            jsonProduct?.options?.[idx]?.values;
                          const variant = productOption.find(
                            (pd: any) => pd.salla_value_id == option.value.id
                          );
                          const value = {
                            price: {
                              amount:
                                variant.original_price || product.main_price,
                            },
                          };
                          const result = {
                            ...option,
                            value: Object.assign({}, option?.value || {}, value),
                          };
  
                          return result;
                        })
                      );
  
                      sub_total +=
                        options[0]?.value.price.amount || product.main_price;
                      meta[productId] = {
                        vendor_commission: product?.vendor_commission,
                        vendor_price: product?.vendor_price,
                      };
                      total = +sub_total;
                      return {
                        sku: item?.sku,
                        quantity: item?.quantity,
                        thumbnail: item?.thumbnail,
                        product,
                        options,
                      };
                    } else {
                      // console.log("not found ", product?.id);
                      console.log("not found ", product);
                      return null;
                    }
                  } catch (error) {
                    console.error("Error fetching product:", error);
                    return null;
                  }
                })
              );
              const validItems = items.filter((item) => item !== null);
              if (validItems.length) {
                order.items = validItems;
                order.amounts = {
                  total: {
                    amount: total,
                  },
                };
                await order.save();
              } else {
                await Order.findByIdAndDelete(order.id).then(() =>
                  console.log("order deleted " + order.id)
                );
              }
            }
          }
        });
      }
      paginateOptions.page++;
      await new Promise((resolve) => setTimeout(resolve, 10000));
    } while (orders.length === paginateOptions.limit);
  } catch (error: any) {
    console.log("error",error,error.response);
    // throw new ApiError('500',error)
  }
});
