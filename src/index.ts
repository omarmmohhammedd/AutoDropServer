import express from "express";
import("./utils/passport");
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss";
import compression from "compression";
import { conect } from "./utils/DBConnection";
import userRoutes from "./routes/userRoutes";
import tokenRoutes from "./routes/tokenRoutes";
import globalErrorHandler from "./controllers/errorController";
import AppError from "./utils/appError";
import handlerRoutes from "./routes/handler.routes";
import productsRoutes from "./routes/products.routes";
import sallaRoutes from "./routes/salla.routes";
import searchRoutes from "./routes/search.routes";
import shippingRoutes from "./routes/shipping.routes";
import settingRoute from "./routes/settings.route";
import { createHmac } from 'crypto';
import WebHookHandler from "./controllers/Webhook/WebHookHandler";
import orderRoutes from './routes/order.routes';
import TokenRefreshHandler from "./cron/aliexpress/tokens/TokenRefreshHandler";
import ProductUpToDate from "./cron/aliexpress";
import catchAsync from "./utils/catchAsync";
import { sendSubscription, sendSubscriptionError } from "./controllers/Webhook/utils/sendSubscription";
import { Plan } from "./models/Plan.model";
import { updateOrderStatusUpdated } from "./cron/orders";
import RequestSenderToHost from "./cron/host";
import homeRouter from "./routes/home.routes";
import subscriptionRoutes from "./routes/subscription.routes";
const app = express();

//Parse json bodies
app.use(express.json({ limit: '50mb' }));
//Parse cookies
app.use(cookieParser());

//Allow cors for all domains
app.use(
  cors({
    origin: "*",
    credentials: true,
  }) as any
);

//Session middleware
app.use(
  session({
    secret: process.env.secret!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      httpOnly: true,
    },
  })
);

//Initialize passport
app.use(passport.initialize());

//Use passport session
app.use(passport.session());

//Use morgan logger in the develpment
app.use(morgan("dev"));

//Set security http headers
app.use(helmet());

//Data sanitization against xss attacks
xss('<script>alert("xss");</script>');

//Compress all text sent in the response to the client
if (process.env.NODE_ENV === "production") {
  app.use(compression());
}

conect();

// websocket
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

let clients:any = {};

wss.on('connection', (ws:any) => {
  console.log('New client connected');


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
app.use((req:any, res, next) => {
  req.clients = clients;
  next();
});
// websocket
//Global resources
app.use('/',homeRouter)
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/handler", handlerRoutes);
app.use("/api/v1/token", tokenRoutes);
app.use("/api/v1/aliexpress", productsRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/salla", sallaRoutes);
app.use("/api/v1/shipping", shippingRoutes);
app.use("/api/v1/settings", settingRoute  );
app.use("/api/v1/orders", orderRoutes  );
app.use("/api/v1/subscription", subscriptionRoutes  );


app.post("/webhooks/subscribe", async (req, res,next) => {
  const requestHMAC = req.header("x-salla-signature");
  // const secret = await findSettingKey("SALLA_WEBHOOK_TOKEN");
  console.log("WEBHOOK REQUEST")
  const secret = process.env.WEBHOOK_SECRET as string;
  const computedHMAC =createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  const signatureMatches = requestHMAC === computedHMAC;

  if (!signatureMatches) {
    console.log("signatureMatches is ",signatureMatches)
    return res.sendStatus(401);
  }

  await WebHookHandler(req,res,next,clients,WebSocket);
if(!res.headersSent){
return res.sendStatus(200);
}
  // res.sendStatus(200);
});

app.post("/api/v1/websocketHandler",catchAsync(async (req, res,next) => {
  let {subscription,plan,event} = req.body
console.log("subscription is ",subscription)  
console.log("req.body is ",req.body)  
console.log("event is ",event)  

  if(event == "app.subscription.renewed" ){

    if (!plan) {
      plan = await Plan.findById(subscription.plan);
      if(!plan) return console.error("Plan not found");
    }
    sendSubscription(subscription, plan, subscription.user, clients, WebSocket);
    return res.sendStatus(200);
  }else if (event =="subscription-expired" || event=="subscription-orders-limit-reached"|| event=="subscription-products-limit-reached" || event=="resetSalla"){
    sendSubscriptionError(event,req.body.userId,clients,WebSocket)
    return res.sendStatus(200);
  }else{
    return res.sendStatus(404);
  }
}));


// Handle requests from wrong urls
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Using global error handling middleware
app.use(globalErrorHandler);

server.listen(10000, () => {
  console.log(`server is running `);
  TokenRefreshHandler.start()
  ProductUpToDate.start()
  updateOrderStatusUpdated.start()
  RequestSenderToHost.start()
});
