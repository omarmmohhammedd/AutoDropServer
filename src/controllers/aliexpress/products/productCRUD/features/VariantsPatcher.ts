import { ProductSchema } from "../../../../../models/product.model";
import { UpdateProductVariant, UpdateProductVariantSale } from "../CRUD";
import fs from "fs";

export interface ISallaVariant {
  id: number;

  price: { amount: number; currency: string };
  regular_price: { amount: number; currency: string };
  cost_price: { amount: number; currency: string };
  sale_price: any;
  has_special_price: boolean;
  stock_quantity: number;
  unlimited_quantity: boolean;

  notify_low: any;
  barcode: string;
  sku: string;
  mpn?: string;
  gtin?: string;
  related_options: number[];
  related_option_values: number[];
  weight: number | null | string;
  weight_type: string;
  weight_label: string;
  is_default: boolean;
  is_user_subscribed_to_sku: boolean;
}
interface VariantsPatcherProps {
  product: ProductSchema;
  totalPages: number;
  beginIndex: number;
  perPage: number;
  token: string;
  currentPage: number;
  variantsResponse: any;
}
function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
export default async function VariantsPatcher({
  product,
  totalPages,
  beginIndex,
  perPage,
  token,
  variantsResponse,
  currentPage,
}: VariantsPatcherProps) {
  console.log("reached variants patcher");
  let {
    variantsArr,
    showDiscountPrice,
    commissionPercentage,
    vendor_commission,
    shipping,
  } = product;
  const variants = variantsResponse?.data?.filter((e: any) => !e.sku);
  fs.appendFile("variantsResponse.json",JSON.stringify(variantsResponse, null, 2), () => {}); 
  fs.writeFile("variantsArr.json",JSON.stringify(variantsArr, null, 2), () => {}); 
  const sallaVariants = variants.map((el: any) => {
    let { related_option_values, id, is_default } = el;
    return { related_option_values, id, is_default };
  });
  // variantsArr should have the same number of elements as variants received from salla
  console.log("sallaVariants.length", sallaVariants.length);
  console.log("variantsArr.length", variantsArr.length);
  console.log(
    "variants.length===sallaVariants.length",
    variantsArr.length === sallaVariants.length
  );
  if (sallaVariants.length != variantsArr.length) {
    console.log(
      "variantsArr should have the same number of elements as variants received from salla"
    );
  }
  let sallaPromises = sallaVariants.map((sallaVariant: ISallaVariant) => {
    let { id, related_option_values, is_default } = sallaVariant;
    let variantToBeUpdated = variantsArr.find((variant: any) => {
      let valid = true;
      if ( !Array.isArray(related_option_values)) console.log("sallaVariant no related option values", sallaVariant);
      for (let i = 0; i < related_option_values.length; i++) {
        let currentId = related_option_values[i];
        if (!variant.sallaValues.includes(currentId)) {
          valid = false;
        }
      }
      if(valid){
  fs.appendFile("matchedIDS.json",JSON.stringify({related_option_values,sallaValues:variant.sallaValues}, null, 2), () => {}); 
        
      }
      return valid;
    });
    if (!variantToBeUpdated) {
      fs.writeFile(
        "error.json",
        "corresponding variant from salla in variantsArr not found ",
        () => {}
      );
    }
    console.log("variantToBeUpdated", variantToBeUpdated);
    fs.writeFile(
      "output/success.json",
      "corresponding variant from salla in variantsArr found",
      () => {}
    );
    let variantId = sallaVariant.id;
    let {
      offer_sale_price: priceString,
      sku_available_stock: quantity,
      sku_id,
      sku_price: oldPrice,
      shippingChoice,
      commission,
      profitTypeValue,
    } = variantToBeUpdated satisfies { commission: number };

    let price = parseFloat(priceString);
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
  /*     shipping?.length != 0 &&
      shippingChoice == "shippingIncluded" */
      product.shippingIncludedChoice
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
  fs.writeFile(
    "variants.json",
    JSON.stringify({ variants }, null, 2),
    (err) => {
      console.error(err);
    }
  );
  if (!variants) {
    console.log("No variants");
  }
  let variantsIds = variants.map((el: any) => {
    return el.id;
  });
  console.log("variantsIds", variantsIds);

  let variantsAccordingToPages = variantsArr;
  if (totalPages > 1) {
    if (currentPage * perPage > variantsArr.length) {
      variantsAccordingToPages = variantsArr.slice(beginIndex);
    } else {
      variantsAccordingToPages = variantsArr.slice(beginIndex, perPage);
    }
  }
  console.log(
    "variantsAccordingToPages.length",
    variantsAccordingToPages.length
  );
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
  let results: PromiseSettledResult<any>[] = await Promise.allSettled(
    sallaPromises
  );
  let errorArrayVariants: any = [];

  results.map((result: any, index: number) => {
    if (result?.status == "rejected") {
      errorArrayVariants.push({ result, index });
      console.log("A VARIANT IS UNDEFINED");
    }
    // console.log(result?.value?.data);
  });
  fs.writeFile(
    "output/updatingVariants.json",
    JSON.stringify(results, null, 2),
    () => {}
  );
  console.log("errorArrayVariants", errorArrayVariants);
  return errorArrayVariants;
}
