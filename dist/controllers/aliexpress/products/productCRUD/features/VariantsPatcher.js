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
const CRUD_1 = require("../CRUD");
const fs_1 = __importDefault(require("fs"));
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
function VariantsPatcher(_a) {
    return __awaiter(this, arguments, void 0, function* ({ product, totalPages, beginIndex, perPage, token, variantsResponse, currentPage, }) {
        var _b;
        console.log("reached variants patcher");
        let { variantsArr, showDiscountPrice, commissionPercentage, vendor_commission, shipping, } = product;
        const variants = (_b = variantsResponse === null || variantsResponse === void 0 ? void 0 : variantsResponse.data) === null || _b === void 0 ? void 0 : _b.filter((e) => !e.sku);
        fs_1.default.appendFile("variantsResponse.json", JSON.stringify(variantsResponse, null, 2), () => { });
        fs_1.default.writeFile("variantsArr.json", JSON.stringify(variantsArr, null, 2), () => { });
        const sallaVariants = variants.map((el) => {
            let { related_option_values, id, is_default } = el;
            return { related_option_values, id, is_default };
        });
        // variantsArr should have the same number of elements as variants received from salla
        console.log("sallaVariants.length", sallaVariants.length);
        console.log("variantsArr.length", variantsArr.length);
        console.log("variants.length===sallaVariants.length", variantsArr.length === sallaVariants.length);
        if (sallaVariants.length != variantsArr.length) {
            console.log("variantsArr should have the same number of elements as variants received from salla");
        }
        let sallaPromises = sallaVariants.map((sallaVariant) => {
            var _a, _b;
            let { id, related_option_values, is_default } = sallaVariant;
            let variantToBeUpdated = variantsArr.find((variant) => {
                let valid = true;
                if (!Array.isArray(related_option_values))
                    console.log("sallaVariant no related option values", sallaVariant);
                for (let i = 0; i < related_option_values.length; i++) {
                    let currentId = related_option_values[i];
                    if (!variant.sallaValues.includes(currentId)) {
                        valid = false;
                    }
                }
                if (valid) {
                    fs_1.default.appendFile("matchedIDS.json", JSON.stringify({ related_option_values, sallaValues: variant.sallaValues }, null, 2), () => { });
                }
                return valid;
            });
            if (!variantToBeUpdated) {
                fs_1.default.writeFile("error.json", "corresponding variant from salla in variantsArr not found ", () => { });
            }
            console.log("variantToBeUpdated", variantToBeUpdated);
            fs_1.default.writeFile("output/success.json", "corresponding variant from salla in variantsArr found", () => { });
            let variantId = sallaVariant.id;
            let { offer_sale_price: priceString, sku_available_stock: quantity, sku_id, sku_price: oldPrice, shippingChoice, commission, profitTypeValue, } = variantToBeUpdated;
            let price = parseFloat(priceString);
            if (commission != 0 && commission > 0) {
                if (profitTypeValue == "number") {
                    price = price + commission;
                }
                else if (profitTypeValue == "percentage") {
                    price = (commission / 100) * price + price;
                }
            }
            else {
                if (vendor_commission && !commissionPercentage) {
                    price = price + vendor_commission;
                }
                else if (vendor_commission && commissionPercentage) {
                    price = (vendor_commission / 100) * price + price;
                }
            }
            if (
            //@ts-ignore
            /*     shipping?.length != 0 &&
                shippingChoice == "shippingIncluded" */
            product.shippingIncludedChoice) {
                let shippingIncludedChoiceIndex = 0;
                if (product === null || product === void 0 ? void 0 : product.shippingIncludedChoice) {
                    shippingIncludedChoiceIndex = (product === null || product === void 0 ? void 0 : product.shippingIncludedChoiceIndex) || 0;
                }
                //@ts-ignore
                let extraShippingCost = 
                //@ts-ignore
                ((_b = (_a = shipping === null || shipping === void 0 ? void 0 : shipping[shippingIncludedChoiceIndex]) === null || _a === void 0 ? void 0 : _a.freight) === null || _b === void 0 ? void 0 : _b.cent) / 100;
                console.log("extraShippingCost", extraShippingCost);
                price += extraShippingCost;
                console.log("price", price);
            }
            let mnp = getRandomInt(100000000000000, 999999999999999);
            let gitin = getRandomInt(10000000000000, 99999999999999);
            let barcode = [mnp, gitin].join("");
            // add condition for sale enabling in product
            if (oldPrice && showDiscountPrice) {
                return (0, CRUD_1.UpdateProductVariantSale)(variantId, barcode, oldPrice, quantity, mnp, gitin, sku_id, token, price);
            }
            return (0, CRUD_1.UpdateProductVariant)(variantId, barcode, price, quantity, mnp, gitin, sku_id, token);
        });
        fs_1.default.writeFile("variants.json", JSON.stringify({ variants }, null, 2), (err) => {
            console.error(err);
        });
        if (!variants) {
            console.log("No variants");
        }
        let variantsIds = variants.map((el) => {
            return el.id;
        });
        console.log("variantsIds", variantsIds);
        let variantsAccordingToPages = variantsArr;
        if (totalPages > 1) {
            if (currentPage * perPage > variantsArr.length) {
                variantsAccordingToPages = variantsArr.slice(beginIndex);
            }
            else {
                variantsAccordingToPages = variantsArr.slice(beginIndex, perPage);
            }
        }
        console.log("variantsAccordingToPages.length", variantsAccordingToPages.length);
        /*   let promises = variantsAccordingToPages.map((el: any, index: number) => {
          let variantId = variantsIds[index];
          let {
            offer_sale_price: priceString,
            sku_available_stock: quantity,
            sku_id,
            sku_price: oldPrice,
            shippingChoice,
            commission,
            profitTypeValue,
          } = el satisfies { commission: number };
      
          let price = parseFloat(priceString);
          console.log("quantity", quantity);
          if (commission != 0 && commission > 0) {
            if (profitTypeValue == "number") {
              price = price + commission;
            } else if (profitTypeValue == "percentage") {
              price = (commission / 100) * price + price;
            }
          } else {
            if (vendor_commission && !commissionPercentage) {
              price = price + vendor_commission;
            } else if (vendor_commission && commissionPercentage) {
              price = (vendor_commission / 100) * price + price;
            }
          }
      
          if (
            //@ts-ignore
            shipping?.length != 0 &&
            shippingChoice == "shippingIncluded"
          ) {
            let shippingIncludedChoiceIndex = 0;
            if (product?.shippingIncludedChoice) {
              shippingIncludedChoiceIndex = product?.shippingIncludedChoiceIndex || 0;
            }
            //@ts-ignore
      
            let extraShippingCost =
              //@ts-ignore
              shipping?.[shippingIncludedChoiceIndex]?.freight?.cent / 100;
            console.log("extraShippingCost", extraShippingCost);
            price += extraShippingCost;
            console.log("price", price);
          }
          let mnp = getRandomInt(100000000000000, 999999999999999);
          let gitin = getRandomInt(10000000000000, 99999999999999);
          let barcode = [mnp, gitin].join("");
          // add condition for sale enabling in product
          if (oldPrice && showDiscountPrice) {
            return UpdateProductVariantSale(
              variantId,
              barcode,
              oldPrice,
              quantity,
              mnp,
              gitin,
              sku_id,
              token,
              price
            );
          }
          return UpdateProductVariant(
            variantId,
            barcode,
            price,
            quantity,
            mnp,
            gitin,
            sku_id,
            token
          );
        });
        let results = await Promise.allSettled(promises); */
        let results = yield Promise.allSettled(sallaPromises);
        let errorArrayVariants = [];
        results.map((result, index) => {
            if ((result === null || result === void 0 ? void 0 : result.status) == "rejected") {
                errorArrayVariants.push({ result, index });
                console.log("A VARIANT IS UNDEFINED");
            }
            // console.log(result?.value?.data);
        });
        fs_1.default.writeFile("output/updatingVariants.json", JSON.stringify(results, null, 2), () => { });
        console.log("errorArrayVariants", errorArrayVariants);
        return errorArrayVariants;
    });
}
exports.default = VariantsPatcher;
