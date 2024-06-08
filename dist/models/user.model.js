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
const bcrypt_1 = require("bcrypt");
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const Plan_model_1 = require("./Plan.model");
const Subscription_model_1 = require("./Subscription.model");
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const Setting_model_1 = __importDefault(require("./Setting.model"));
const userModel = new mongoose_1.default.Schema({
    name: { type: String, required: true, maxLength: 40 },
    uniqueId: { type: String, unique: true },
    email: { type: String, required: true, maxLength: 40, unique: true },
    password: { type: String, required: true, maxLength: 150 },
    role: { type: String, default: "client", enum: ["admin", "client"] },
    image: {
        type: String,
        default: "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
    },
    phone: { type: String, default: null, maxLength: 25 },
    country: { type: String, default: null, maxLength: 25 },
    merchantID: { type: Number, default: null, maxLength: 25 },
    storeName: { type: String, default: null, maxLength: 50 },
    storeLink: { type: String, default: null, maxLength: 50 },
    OTP: { type: String, maxLength: 10 },
    aliExpressToken: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "AliExpressToken",
    },
    sallaToken: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "SallaToken",
    },
    code: {
        type: String,
    },
    active: {
        type: Boolean,
        default: false,
    },
    tokens: {
        type: Array,
        default: [],
    },
    setting: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Setting" },
    // plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    subscription: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Subscription" },
    planName: {
        type: String,
        default: "Basic",
    },
}, { timestamps: true });
userModel.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        /*  if (user.isModified("password")) {
           user.password = await hash(user.password, 12);
         } */
        if (this.isNew) {
            const numbers = '0123456789';
            // Function to get a random character from a string
            const getRandomChar = (str) => str[Math.floor(crypto_1.default.randomInt(0, str.length))];
            // Ensure password contains at least one character from each set
            let password = '';
            password += getRandomChar(numbers);
            // Fill the rest of the password with random characters from all sets
            for (let i = password.length; i < 10; i++) {
                password += getRandomChar(numbers);
            }
            // Shuffle the password to ensure randomness
            this.uniqueId = password.split('').sort(() => 0.5 - Math.random()).join('');
            let plan = yield Plan_model_1.Plan.findOne({ name: "Basic" });
            if (plan) {
                const subscription = yield Subscription_model_1.Subscription.create({
                    start_date: (0, moment_1.default)().toDate(),
                    expiry_date: null,
                    plan: plan.id,
                    user: user.id,
                    orders_limit: plan.orders_limit,
                    products_limit: plan.products_limit,
                });
                // this.plan = plan._id;
                this.subscription = subscription._id;
            }
            const userSetting = yield Setting_model_1.default.create({ userId: this.id });
            console.log(userSetting);
            this.setting = userSetting._id;
            /*     if (this.isModified("subscription") && this.subscription == null) {
                  this.plan = null;
                  this.planName = "Basic";
                } */
        }
        next();
    });
});
userModel.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(password, this.password);
    });
};
userModel.plugin(mongoose_paginate_v2_1.default);
const User = mongoose_1.default.model("User", userModel);
exports.default = User;
