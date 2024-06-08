"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
Promise.resolve().then(() => __importStar(require("./utils/passport")));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const xss_1 = __importDefault(require("xss"));
const compression_1 = __importDefault(require("compression"));
const DBConnection_1 = require("./utils/DBConnection");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const tokenRoutes_1 = __importDefault(require("./routes/tokenRoutes"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const appError_1 = __importDefault(require("./utils/appError"));
const handler_routes_1 = __importDefault(require("./routes/handler.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const salla_routes_1 = __importDefault(require("./routes/salla.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const shipping_routes_1 = __importDefault(require("./routes/shipping.routes"));
const settings_route_1 = __importDefault(require("./routes/settings.route"));
const crypto_1 = require("crypto");
const WebHookHandler_1 = __importDefault(require("./controllers/Webhook/WebHookHandler"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const TokenRefreshHandler_1 = __importDefault(require("./cron/aliexpress/tokens/TokenRefreshHandler"));
const aliexpress_1 = __importDefault(require("./cron/aliexpress"));
const catchAsync_1 = __importDefault(require("./utils/catchAsync"));
const sendSubscription_1 = require("./controllers/Webhook/utils/sendSubscription");
const Plan_model_1 = require("./models/Plan.model");
const orders_1 = require("./cron/orders");
const host_1 = __importDefault(require("./cron/host"));
const home_routes_1 = __importDefault(require("./routes/home.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const app = (0, express_1.default)();
//Parse json bodies
app.use(express_1.default.json({ limit: '50mb' }));
//Parse cookies
app.use((0, cookie_parser_1.default)());
//Allow cors for all domains
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
//Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // secure: process.env.NODE_ENV === "production",
        secure: false,
        httpOnly: true,
    },
}));
//Initialize passport
app.use(passport_1.default.initialize());
//Use passport session
app.use(passport_1.default.session());
//Use morgan logger in the develpment
app.use((0, morgan_1.default)("dev"));
//Set security http headers
app.use((0, helmet_1.default)());
//Data sanitization against xss attacks
(0, xss_1.default)('<script>alert("xss");</script>');
//Compress all text sent in the response to the client
if (process.env.NODE_ENV === "production") {
    app.use((0, compression_1.default)());
}
(0, DBConnection_1.conect)();
// websocket
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
let clients = {};
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        try {
            const { id } = JSON.parse(message);
            if (typeof id === 'string') {
                clients[id] = ws;
            }
            else {
                console.error('Invalid ID:', id);
            }
        }
        catch (error) {
            console.error('Failed to parse message:', message, error);
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
        // Remove the WebSocket from the clients object when it's closed
        Object.keys(clients).forEach((clientId) => {
            if (clients[clientId] === ws) {
                delete clients[clientId];
            }
        });
    });
});
app.use((req, res, next) => {
    req.clients = clients;
    next();
});
// websocket
//Global resources
app.use('/', home_routes_1.default);
app.use("/api/v1/auth", userRoutes_1.default);
app.use("/api/v1/handler", handler_routes_1.default);
app.use("/api/v1/token", tokenRoutes_1.default);
app.use("/api/v1/aliexpress", products_routes_1.default);
app.use("/api/v1/search", search_routes_1.default);
app.use("/api/v1/salla", salla_routes_1.default);
app.use("/api/v1/shipping", shipping_routes_1.default);
app.use("/api/v1/settings", settings_route_1.default);
app.use("/api/v1/orders", order_routes_1.default);
app.use("/api/v1/subscription", subscription_routes_1.default);
app.post("/webhooks/subscribe", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requestHMAC = req.header("x-salla-signature");
    // const secret = await findSettingKey("SALLA_WEBHOOK_TOKEN");
    console.log("WEBHOOK REQUEST");
    const secret = process.env.WEBHOOK_SECRET;
    const computedHMAC = (0, crypto_1.createHmac)("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");
    const signatureMatches = requestHMAC === computedHMAC;
    if (!signatureMatches) {
        console.log("signatureMatches is ", signatureMatches);
        return res.sendStatus(401);
    }
    yield (0, WebHookHandler_1.default)(req, res, next, clients, WebSocket);
    if (!res.headersSent) {
        return res.sendStatus(200);
    }
    // res.sendStatus(200);
}));
app.post("/api/v1/websocketHandler", (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { subscription, plan, event } = req.body;
    console.log("subscription is ", subscription);
    console.log("req.body is ", req.body);
    console.log("event is ", event);
    if (event == "app.subscription.renewed") {
        if (!plan) {
            plan = yield Plan_model_1.Plan.findById(subscription.plan);
            if (!plan)
                return console.error("Plan not found");
        }
        (0, sendSubscription_1.sendSubscription)(subscription, plan, subscription.user, clients, WebSocket);
        return res.sendStatus(200);
    }
    else if (event == "subscription-expired" || event == "subscription-orders-limit-reached" || event == "subscription-products-limit-reached" || event == "resetSalla") {
        (0, sendSubscription_1.sendSubscriptionError)(event, req.body.userId, clients, WebSocket);
        return res.sendStatus(200);
    }
    else {
        return res.sendStatus(404);
    }
})));
// Handle requests from wrong urls
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
//Using global error handling middleware
app.use(errorController_1.default);
server.listen(10000, () => {
    console.log(`server is running `);
    TokenRefreshHandler_1.default.start();
    aliexpress_1.default.start();
    orders_1.updateOrderStatusUpdated.start();
    host_1.default.start();
});
