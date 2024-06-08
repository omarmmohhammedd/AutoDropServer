//@ts-nocheck
import mongoose from "mongoose";
import User from "../src/models/user.model";
import {Plan, PlanDocument} from "../src/models/Plan.model";
import {Subscription, SubscriptionDocument} from "../src/models/Subscription.model";
import dotenv from 'dotenv';
import moment from "moment";
import axios from 'axios';
dotenv.config({ path: ".env" });
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7777 });
let clients:any = {};
wss.on('connection', (ws:any) => {
  console.log('New client connected');

  // This is where you would get your subscription data
  const subscriptionData = {planName:"Test"};

  // Send the subscription data to the client
  // ws.send(JSON.stringify(subscriptionData));
  ws.on('message', (message:string) => {
    try {
      const { id } = JSON.parse(message);
      if (typeof id === 'string') {
        clients[id] = ws;
      } else {
        console.error('Invalid ID:', id);
      }
    } catch (error) {
      console.error('Failed to parse message:', message, error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove the WebSocket from the clients object when it's closed
    Object.keys(clients).forEach((clientId:string) => {
      if (clients[clientId] === ws) {
        delete clients[clientId];
      }
    });
  });
});
 const  sendSubscription = async(subscription:SubscriptionDocument,plan:PlanDocument,userId:string)=>{
  const subscriptionJSON = subscription.toJSON()
  subscriptionJSON.planName = plan.name
  subscriptionJSON.eventType = "subscription"
  subscriptionJSON.subscriptionStart= subscriptionJSON.start_date
  subscriptionJSON.subscriptionExpiry= subscriptionJSON.expiry_date
  subscriptionJSON.subscriptionOrdersLimit= subscriptionJSON.orders_limit
  subscriptionJSON.subscriptionProductsLimit= subscriptionJSON.products_limit
  
  
  subscriptionJSON.totalOrdersLimit= plan.orders_limit
  subscriptionJSON.totalProductsLimit= plan.products_limit
  // let dataToBeSent = subscriptionJSON
  // const subscriptionParam =JSON.stringify(subscriptionJSON)
  const client = clients[userId];
  const sendClient = ()=>{

    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(subscriptionJSON));
            return true
    } else {
      console.error('Failed to send message: client not connected');
      return false
    }  
  }
  let notDone = true
/* while (notDone){
  setTimeout(()=>{

    notDone = !sendClient()
  },1000)

} */
sendClient()
  return 
  }
const handler = async()=>{

  // await new Promise((resolve) => setTimeout(resolve, 10000));

      await mongoose.connect(process.env.DB_URL!);

    const user = await User.findOne({email:"fuyprimed0@gmail.com"});
    let plan = await Plan.findOne({price:333})
    if(!user  || !plan){
        return
    }
// await Subscription.deleteMany({user:user.id})
    
   
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
    if(plan && subscription){
      user.plan = plan._id
      user.subscription = subscription._id
      
  }
  await subscription.save()
  setInterval(()=>{
      try{
        sendSubscription(subscription,plan,user.id)

      }catch(err:any){
        console.error(err)
        console.error("failed to send subscription to frontend")
      }
    },3000)
    await mongoose.connection.close()
}
handler().then(()=>console.log("Success")).catch((err)=>console.log(err))
