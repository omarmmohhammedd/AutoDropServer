import axios from "axios";
import { SubscriptionDocument, SubscriptionSchema } from "../../../models/Subscription.model";
import { Plan, PlanDocument } from "../../../models/Plan.model";
interface ISubscriptionToBeSent extends SubscriptionSchema {
  planName: string;
  eventType: string;
  subscriptionStart: Date;
  subscriptionExpiry: Date;
  subscriptionOrdersLimit: number;
  subscriptionProductsLimit: number;
  totalOrdersLimit: number;
  totalProductsLimit: number;
}
export const sendSubscription = async (
  subscription: SubscriptionSchema,
  plan: PlanDocument,
  userId: string,
  clients: any,
  WebSocket: any
) => {
  /* if (!plan) {
    plan = await Plan.findById(subscription.plan);
    if(!plan) return console.error("Plan not found");
  } */
console.log("subscription is ",subscription)  
  // const subscriptionJSON = subscription.toJSON();
  let subscriptionToBeSent:Partial<ISubscriptionToBeSent> = subscription ;
  subscriptionToBeSent.planName = plan.name;
  subscriptionToBeSent.eventType = "subscription";
  subscriptionToBeSent.subscriptionStart = subscription.start_date;
  subscriptionToBeSent.subscriptionExpiry = subscription.expiry_date;
  subscriptionToBeSent.subscriptionOrdersLimit = subscription.orders_limit;
  subscriptionToBeSent.subscriptionProductsLimit = subscription.products_limit;

  subscriptionToBeSent.totalOrdersLimit = plan.orders_limit;
  subscriptionToBeSent.totalProductsLimit = plan.products_limit;
  // let dataToBeSent = subscriptionJSON
  // const subscriptionParam =JSON.stringify(subscriptionJSON)
  const client = clients[userId];
  const sendClient = () => {
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(subscriptionToBeSent));
      return true;
    } else {
      console.error("Failed to send message: client not connected");
      return false;
    }
  };

  sendClient();
  return;
};

export const sendSubscriptionError = async (
event:string,
  userId: string,
  clients: any,
  WebSocket: any
) => {
 
  const client = clients[userId];
  const sendClient = () => {
 let  subscriptionToBeSent = {eventType : event};

    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(subscriptionToBeSent));
      return true;
    } else {
      console.error("Failed to send message: client not connected");
      return false;
    }
  };

  sendClient();
  return;
};
