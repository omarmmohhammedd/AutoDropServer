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
Object.defineProperty(exports, "__esModule", { value: true });
const Plan_model_1 = require("../models/Plan.model");
function DefaultDocChecker() {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultPlan = yield Plan_model_1.Plan.findOne({ is_default: true });
        let planCount = yield Plan_model_1.Plan.countDocuments();
        if (!defaultPlan) {
            yield Plan_model_1.Plan.create({
                name: "Basic",
                description: "This is the free plan",
                is_default: true,
                orders_limit: 1,
                products_limit: 2,
            });
        }
        if (planCount < 4) {
            const plans = [
                { name: "تجريبي 1", price: 99, is_monthly: true, is_yearly: false, orders_limit: 1, products_limit: 2, is_default: false },
                { name: "تجريبي 2", price: 333, is_monthly: true, is_yearly: false, orders_limit: 10, products_limit: 20, is_default: false },
                { name: "تجريبي 3", price: 999, is_monthly: false, is_yearly: true, orders_limit: 100, products_limit: 200, is_default: false },
                { name: "تجريبي 4", price: 5555, is_monthly: false, is_yearly: true, orders_limit: 1000, products_limit: 2000, is_default: false },
            ];
            yield Promise.all(plans.map(plan => {
                return Plan_model_1.Plan.create(plan);
            }));
        }
        let deleteAllPlans = false;
        if (deleteAllPlans) {
            yield Plan_model_1.Plan.deleteMany({});
        }
        return true;
    });
}
exports.default = DefaultDocChecker;
