import { ProductSchema } from "../../../models/product.model";

export const IsPriceDifferent = (
  product: ProductSchema,
  findProduct: ProductSchema
): boolean => {
  let findProdVarLength = findProduct?.variantsArr?.length;
  let oldProdVarLength = product?.variantsArr?.length;
  if (oldProdVarLength !== findProdVarLength) {
    return true;
  }
  for (let i = 0; i < findProdVarLength; i++) {
    let findProdPriceCurrVariant = Number(
      findProduct?.variantsArr?.[i]?.offer_sale_price
    );
    let oldProdPriceCurrVariant = Number(
      product?.variantsArr?.[i]?.offer_sale_price
    );

    if (findProdPriceCurrVariant !== oldProdPriceCurrVariant) {
      return true;
    }
  }
  return false;
};
//
export const IsQuantityDifferent = (
  product: ProductSchema,
  findProduct: ProductSchema
): boolean => {
  let findProdVarLength = findProduct?.variantsArr?.length;
  let oldProdVarLength = product?.variantsArr?.length;
  if (oldProdVarLength !== findProdVarLength) {
    return true;
  }
  for (let i = 0; i < findProdVarLength; i++) {
    let findProdQuantityCurrVariant = Number(
      findProduct?.variantsArr?.[i]?.sku_available_stock
    );
    let oldProdQuantityCurrVariant = Number(
      product?.variantsArr?.[i]?.sku_available_stock
    );

    if (findProdQuantityCurrVariant !== oldProdQuantityCurrVariant) {
      return true;
    }
  }
  return false;
};
export const IsVariantsDifferent = (
  product: ProductSchema,
  findProduct: ProductSchema
): boolean => {
  let findProdVarLength = findProduct?.variantsArr?.length;
  let oldProdVarLength = product?.variantsArr?.length;
  if (oldProdVarLength !== findProdVarLength) {
    return true;
  }
  for (let i = 0; i < findProdVarLength; i++) {
    let findProdQuantityCurrVariant = Number(
      findProduct?.variantsArr?.[i]?.sku_available_stock
    );
    let oldProdQuantityCurrVariant = Number(
      product?.variantsArr?.[i]?.sku_available_stock
    );
    let findProdPriceCurrVariant = Number(
      findProduct?.variantsArr?.[i]?.offer_sale_price
    );
    let oldProdPriceCurrVariant = Number(
      product?.variantsArr?.[i]?.offer_sale_price
    );
    let priceCondition = oldProdPriceCurrVariant !== findProdPriceCurrVariant;
    let quantityCondition =
      findProdQuantityCurrVariant !== oldProdQuantityCurrVariant &&
      oldProdQuantityCurrVariant <= 50;
    if (priceCondition || quantityCondition) {
      return true;
    }
  }
  return false;
};
