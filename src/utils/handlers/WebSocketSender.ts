import axios, { AxiosRequestConfig } from "axios";
import { SubscriptionDocument, SubscriptionSchema } from "../../models/Subscription.model";

export const WebSocketSender = (subscription:SubscriptionSchema | SubscriptionDocument) => {
    if(!subscription) return console.error("Subscription not found");
    let webSocketReq = {
        url: `${process.env.Backend_Link}websocketHandler`,
        data: {
          event: "app.subscription.renewed",
          subscription: subscription,
        },
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      };
      axios.request(webSocketReq);
}
type IWebSocketError="subscription-expired" | "subscription-orders-limit-reached"| "subscription-products-limit-reached" | "merchant-already-connected"|"resetSalla"
export const WebSocketSendError = (webSocketError:IWebSocketError,userId:any) => {
  let webSocketReq :AxiosRequestConfig= {
    url: `${process.env.Backend_Link}websocketHandler`,
/*     data: {
      event: "app.subscription.renewed",
    }, */
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };
  if(!webSocketError ) return console.error("webSocketError not found");
  if( webSocketError === "subscription-expired"){
    webSocketReq.data = {
      event : "subscription-expired"
    }
  }else if(webSocketError === "subscription-orders-limit-reached"){
    webSocketReq.data = {
      event : "subscription-orders-limit-reached"
    }
  }
  else if(webSocketError === "subscription-products-limit-reached"){
    webSocketReq.data = {
      event : "subscription-products-limit-reached"
    }
  }else if(webSocketError === "merchant-already-connected"){
    webSocketReq.data = {
      event : "merchant-already-connected"
    }
  }else{
    webSocketReq.data = {
      event
    }
  }
  webSocketReq.data.userId=userId
    axios.request(webSocketReq);
    return
}