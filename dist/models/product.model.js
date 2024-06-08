"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const options = {
    name: { type: String, default: null, trim: true },
    sku_id: { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
    price: { type: Number, default: 0, integer: true },
    main_price: { type: Number, default: 0, integer: true },
    vendor_commission: { type: Number, default: 0, integer: true },
    vendor_price: { type: Number, default: 0, integer: true },
    quantity: { type: Number, default: 0, integer: true },
    sku: { type: String, default: null, trim: true },
    images: { type: Array, default: [] },
    options: { type: Array, default: [] },
    metadata_title: { type: String, default: null, trim: true },
    metadata_description: { type: String, default: null, trim: true },
    product_type: { type: String, default: null, trim: true },
    original_product_id: {
        type: String || Number,
        default: null,
        trim: true,
        integer: true,
    },
    salla_product_id: {
        type: String || Number,
        default: null,
        trim: true,
        integer: true,
    },
    merchant: { type: String, default: null, ref: "User", trim: true },
    require_shipping: {
        type: Boolean,
        default: true,
    },
    shipping: [
        {
            shipping_method: {
                type: String,
            },
            service_name: {
                type: String,
            },
            estimated_delivery_time: {
                type: String,
            },
            tracking_available: {
                type: Boolean,
            },
            freight: {
                type: Object,
                cent: { type: String },
                currency: Object,
                currency_code: { type: String, default: "SAR" },
            }, serviceName: {
                type: String,
            },
        },
    ],
    vat: {
        type: Boolean,
        default: false,
    },
    productValuesNumber: { type: Number, default: 0 },
    // category_id: { type: Number, default: null },
    // category_name: { type: String, default: null },
    target_original_price: { type: Number, default: null },
    target_sale_price: { type: Number, default: null },
    first_level_category_name: { type: String, default: null },
    second_level_category_name: { type: String, default: null },
    variantsArr: { type: Array, default: [] },
    commissionPercentage: { type: Boolean, default: true },
    showDiscountPrice: { type: Boolean, default: false },
    discountPrice: { type: Number, default: 0 },
    categoriesSalla: { type: Array, default: [] },
    sallaTags: { type: Array, default: [] },
    shippingIncludedChoice: { type: Boolean, default: false },
    shippingAvailable: { type: Boolean, default: false },
    // checkboxesSelected: { type: Array, default: [] },
    shippingIncludedChoiceIndex: { type: Number, default: -1 },
    country_code: { type: String, default: "SA" },
    // productEditFormOrigin: { type: Boolean, default: false },
    shippingFee: { type: Number, default: 0 },
    defaultImage: { type: String, default: null, select: false },
    highestOptionValue: { type: Number, default: 0, select: false },
};
const schema = new mongoose_1.Schema(options, {
    timestamps: true,
    toObject: { virtuals: true },
});
schema.index({ "$**": "text" });
schema.plugin(mongoose_paginate_v2_1.default);
schema.pre("save", function (next) {
    var _a, _b, _c, _d;
    console.log("SHIPPINGGGGGGGGGGGGGGGGGGGGGGGG", this.shipping);
    if (this.isModified("options")) {
        let options = this.options;
        if (Array.isArray(options) && !((_a = options === null || options === void 0 ? void 0 : options[0]) === null || _a === void 0 ? void 0 : _a.name)) {
            this.productValuesNumber = 0;
        }
        let count = 1;
        if (Array.isArray(options) && options.length > 0) {
            options === null || options === void 0 ? void 0 : options.forEach((option) => {
                count *= option.values.length;
            });
            if (count >= 1) {
                this.productValuesNumber = count;
            }
            else {
                this.productValuesNumber = 0;
            }
        }
    }
    if (Array.isArray(this.shipping) && this.shipping.length > 0) {
        this.shippingAvailable = true;
        let [shipping, included, shipIndex] = [
            this.shipping,
            this.shippingIncludedChoice,
            this.shippingIncludedChoiceIndex,
        ];
        if (!included) {
            this.shippingFee = 0;
        }
        else if (typeof shipIndex == "number" &&
            shipIndex >= 0 &&
            Array.isArray(shipping) &&
            (shipping === null || shipping === void 0 ? void 0 : shipping.length) > 0) {
            this.shipping = this.shipping.map((shipping, index) => {
                let checked = false;
                if (index == shipIndex) {
                    checked = true;
                }
                return Object.assign(Object.assign({}, shipping), { checked });
            });
            let fee = ((_c = (_b = shipping === null || shipping === void 0 ? void 0 : shipping[shipIndex]) === null || _b === void 0 ? void 0 : _b.freight) === null || _c === void 0 ? void 0 : _c.cent) || 0;
            if (fee !== 0) {
                fee /= 100;
            }
            if (fee !== undefined && typeof fee == "number" && fee !== 0) {
                this.shippingFee = fee;
            }
        }
    }
    else {
        this.shippingFee = 0;
        this.shippingAvailable = false;
    }
    if (this.isModified("images")) {
        if (Array.isArray(this.images) && this.images.length > 0) {
            const image = this.images[0];
            this.defaultImage = image.original;
        }
    }
    if (this.isModified("options") || this.isModified("variantsArr")) {
        console.log("THIS variantsArr IS MODIFIEDDDDDD");
        console.log("THIS variantsArr IS MODIFIEDDDDDD");
        console.log("THIS variantsArr IS MODIFIEDDDDDD");
        console.log("THIS variantsArr IS MODIFIEDDDDDD");
        console.log("THIS variantsArr IS MODIFIEDDDDDD");
        console.log("THIS variantsArr IS MODIFIEDDDDDD");
        let highestValue = 0;
        for (let i = 0; i < this.variantsArr.length; i++) {
            let currVariant = (_d = this.variantsArr) === null || _d === void 0 ? void 0 : _d[0];
            let price = Number(currVariant.offer_sale_price);
            highestValue = Math.max(price, highestValue);
        }
        this.highestOptionValue = highestValue;
        console.log("highestValue", highestValue);
        console.log("highestOptionValue", this.highestOptionValue);
    }
    next();
});
const Product = (0, mongoose_1.model)("Product", schema, "products");
exports.Product = Product;
