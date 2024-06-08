"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const options = {
    status: {
        type: String,
        default: null,
    },
    tranRef: {
        type: String,
        default: null,
    },
    amount: {
        type: Number,
        integer: true,
        default: null,
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "User",
    },
    plan: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "Plan",
    },
    order: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        ref: "Order",
    },
};
const schema = new mongoose_1.Schema(options, { timestamps: true });
const Transaction = (0, mongoose_1.model)("Transaction", schema, "Transactions");
exports.Transaction = Transaction;
