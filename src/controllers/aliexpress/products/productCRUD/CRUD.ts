//@ts-nocheck
import axios, { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { pick, uniqBy } from "lodash";
import AppError from "../../../../utils/appError";
import User from "../../../../models/user.model";
import {
  OptionType,
  Product,
  ProductDocument,
  ProductSchema,
  ValueType,
} from "../../../../models/product.model";
import SallaToken from "../../../../models/SallaTokenModel";
import MakeRequest from "../../features/Request";
import AliExpressToken from "../../../../models/AliExpressTokenModel";

export async function CreateProductController(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { role, _id } = req.user;

    const sallaTokenDocument = await SallaToken.findOne({
      _id: req.user.sallaToken,
    });
    let { accessToken } = sallaTokenDocument!;
    let token = accessToken;
    let access_token = accessToken;

    let {
      merchant,
      vendor_commission,
      main_price,
      metadata_title,
      metadata_description,
      name,
      price,
      ...body
    } = pick(req.body, [
      "name",
      "description",
      "vendor_commission",
      "main_price",
      "price",
      "quantity",
      "sku",
      "images",
      "options",
      "metadata_title",
      "metadata_description",
      "product_type",
      "original_product_id",
      "merchant",
    ]) satisfies Partial<ProductSchema>;
    if (price < main_price) {
      [price, main_price] = [main_price, price];
    }

    const product = new Product({
      name: name,
      ...body,
      price,
      vendor_commission,
      main_price,
      merchant: role === "client" ? _id : merchant,
      sku_id: req.body.sku_id,
      vat: req.body?.vat && true,
    });
    console.log(vendor_commission);
    console.log(vendor_commission);
    console.log(vendor_commission);
    console.log(vendor_commission);
    const vendor_price = parseFloat(
      ((main_price * vendor_commission) / 100).toFixed(2)
    );

    product.vendor_price = vendor_price;
    product.vendor_commission = vendor_commission;
    product.metadata_title = metadata_title;
    product.metadata_description = metadata_description;

    const options = body?.options?.map((option: any) => {
      const values = option.values;
      return {
        ...option,
        values: values?.map((value: any) => {
          const valuePrice = value.original_price;
          const vendorOptionPrice = parseFloat(
            (valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2)
          );

          return {
            ...value,
            original_price: valuePrice,
            price: vendorOptionPrice,
          };
        }),
      };
    });

    product.options = options;

    const options_1 = {
      method: "POST",
      url: "https://api.salla.dev/admin/v2/products",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: product.name,
        price: product.price,
        product_type: product.product_type,
        quantity: product.quantity,
        description: product.description,
        cost_price: product.main_price,
        require_shipping: product.require_shipping,
        sku: product.sku,
        images: product.images,
        options: product.options,

        metadata_title,
        metadata_description,
      },
    };

    const jsonProduct = product.toJSON();
    /*     const valuesStock = new Array().concat(
      //@ts-ignore
      ...jsonProduct.options?.map((option: any) => option.values)
    );
    if (valuesStock.length > 100)
      throw new AppError("Values count should be smaller than 100", 400); */

    const { data: productResult } = await axios.request(options_1);
    product.salla_product_id = productResult.data?.id;
    console.log(productResult.data?.id);
    // let SentOptionsResolved = [];
    const getVariantsIds = {
      method: "GET",
      url: `https://api.salla.dev/admin/v2/products/${productResult.data?.id}/variants`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    let variants = await axios.request(getVariantsIds);
    let res = [];
    for (let [index, VarEl] of variants.data.data.entries()) {
      console.log(VarEl.id);
      let op = product.options.map((option) => option.values).flat();
      // console.log(op);
      console.log(op.length);
      console.log(variants.data.data.length);
      if (index >= op.length) {
        console.log("index out of range");
        break;
      }

      let { sku, price, quantity, original_price } = op[index];

      let varUpdate = {
        method: "PUT",
        url: `https://api.salla.dev/admin/v2/products/variants/${VarEl.id}?sku=${sku}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: {
          // sku,
          price,
          stock_quantity: quantity,
          sale_price: price,
        },
      };
      console.log("first variant added with sku", sku);
      res.push(axios.request(varUpdate));
      //
    }

    console.log("done updating price");
    // update quantity
    let res2 = [];
    for (let [index, VarEl] of variants.data.data.entries()) {
      console.log(VarEl.id);
      let op = product.options.map((option) => option.values).flat();
      if (index >= op.length) {
        console.log("index out of range");
        break;
      }
      let { quantity } = op[index];
      console.log(op[index]);
      let varUpdate = {
        method: "PUT",
        url: `https://api.salla.dev/admin/v2/products/quantities/variant/${VarEl.id}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: {
          quantity,
        },
      };

      res2.push(axios.request(varUpdate));
      //
    }
    // console.log(variants);
    console.log("done updating quantity");
    let respData = await Promise.all(res);
    let respData2 = await Promise.all(res2);
    console.log(respData);
    console.log(respData2);
    return;

    //
    /*     for (let option of product.options) {
      for (let value of option.values) {
      }
      let options2 = {
        method: "POST",
        url: `https://api.salla.dev/admin/v2/products/${productResult.data?.id}/options`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          display_type: option.display_type,
          name: option.name,
          values: [option.values[0]],
        },
      };

      let response = await axios.request(options2);
      SentOptionsResolved.push(response);
    } */

    // let resolvedOptions = await Promise.all(SentOptionsResolved);
    /*     let optionsIds = resolvedOptions.map((option: any) => {
      return option.data.data.id;
    }); */

    try {
      // let res2 = await Promise.all(valuseSent.flat());

      // console.log(res2);
      console.log("success");
    } catch (e) {
      //console.log(e);
      //console.log(e.data.error.fields.values);
      // console.log(e.response.data.error.fields);
      console.log(e.response);
    }

    return;
    product.options = await Promise.all(
      // @ts-ignore
      jsonProduct.options?.map(async (option: OptionType, index: number) => {
        let obj: OptionType = option;
        const productOption = productResult.data.options[index];

        const values = await Promise.all(
          option.values.map(async (value: ValueType, idx: number) => {
            const optionValue = productOption?.values[idx];
            const mnp = getRandomInt(100000000000000, 999999999999999);
            const gitin = getRandomInt(10000000000000, 99999999999999);

            console.log(optionValue.id);
            // console.log(optionValue.id);

            return {
              ...value,
              mpn: mnp,
              gtin: gitin,
              // salla_value_id: value?.id,
              //salla_value_id: optionValue?.id,
            };
          })
        );

        obj.salla_option_id = productOption?.id;
        obj.values = values;
      })
    );
    console.log(productResult.data.id);
    const finalOptions = await Promise.all(
      //@ts-ignore
      jsonProduct.options.map(async (option: OptionType, idx: number) => {
        const values = await Promise.all(
          option.values.map(async (optionValue: any, i: number) => {
            const variants =
              (await allVaraint(productResult.data.id, token)) || [];
            const variant = variants.find((item: any) =>
              item.related_option_values?.includes(optionValue.salla_value_id)
            );
            const mnp = getRandomInt(100000000000000, 999999999999999);
            const gitin = getRandomInt(10000000000000, 99999999999999);
            const { price, quantity, mpn, gtin, sku, id, sku_id } = optionValue;
            const barcode = [mnp, gitin].join("");
            if (!variant) return optionValue;
            let result = await UpdateProductVariant(
              variant.id,
              barcode,
              price,
              quantity,
              mnp,
              gitin,
              sku_id,
              access_token
            );
            if (!result) {
              result = await UpdateProductVariant(
                variant.id,
                barcode,
                price,
                quantity,
                mnp,
                gitin,
                sku_id,
                access_token
              );
            }
            return {
              ...optionValue,
              salla_variant_id: result?.data?.id,
            };
          })
        );
        return {
          ...option,
          values,
        };
      })
    );
    let aliexpressDoc = await AliExpressToken.findById(
      req.user.aliExpressToken
    );
    let tokenData = {
      aliExpressAccessToken: aliexpressDoc?.accessToken,
      aliExpressRefreshToken: aliexpressDoc?.refreshToken,
    };
    product.options = finalOptions;
    (async () =>
      await updateVariantFinalOption(product, access_token, tokenData))().then(
      async () => {
        /*         if (subscription.products_limit)
          subscription.products_limit = subscription.products_limit - 1; */
        // await Promise.all([product.save(), subscription.save()]);
        await product.save();
        res.status(200).json({
          message: "Product created successfully",
          result: {
            urls: productResult.data.urls || {},
          },
        });
      }
    );
  } catch (error: AxiosError | any) {
    const isAxiosError = error instanceof AxiosError;
    const values = error?.response?.data;
    console.log(error + "\n\n\n");
    console.log(values);
    console.log(values.error.fields);
    next(
      isAxiosError ? new AppError("UnprocessableEntity " + values, 400) : error
    );
  }
}

export async function CreateProductControllerOld(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    //   let token: string | undefined, account: UserDocument | null;
    //   let subscription: SubscriptionDocument | null;
    //console.log(req.user);
    /*     console.log(req.user._id.toString());
     */
    const { role, _id } = req.user;
    /*     console.log(req.user.aliExpressToken);
    console.log(req.user.sallaToken);
    console.log(req.user.role); */
    const sallaTokenDocument = await SallaToken.findOne({
      _id: req.user.sallaToken,
    });
    let { accessToken } = sallaTokenDocument!;
    let token = accessToken;
    let access_token = accessToken;
    // console.log(access_token);
    // console.log(token);
    // console.log(req.user.sallaToken);
    /*    const { access_token, user_id, userType } = pick(req.local, [
      "user_id",
      "access_token",
      "userType",
    ]);
 */
    let {
      merchant,
      vendor_commission,
      main_price,
      metadata_title,
      metadata_description,
      name,
      price,
      ...body
    } = pick(req.body, [
      "name",
      "description",
      "vendor_commission",
      "main_price",
      "price",
      "quantity",
      "sku",
      "images",
      "options",
      "metadata_title",
      "metadata_description",
      "product_type",
      "original_product_id",
      "merchant",
    ]) satisfies Partial<ProductSchema>;
    if (price < main_price) {
      [price, main_price] = [main_price, price];
    }
    console.log(name);
    /*   subscription = await CheckSubscription(
      userType === "vendor" ? user_id : merchant,
      "products_limit"
    ); */

    const product = new Product({
      name: name,
      ...body,
      price,
      vendor_commission,
      main_price,
      merchant: role === "client" ? _id : merchant,
      sku_id: req.body.sku_id,
      vat: req.body?.vat && true,
    });

    const vendor_price = parseFloat(
      ((main_price * vendor_commission) / 100).toFixed(2)
    );

    product.vendor_price = vendor_price;
    product.vendor_commission = vendor_commission;
    product.metadata_title = metadata_title;
    product.metadata_description = metadata_description;

    const options = body?.options?.map((option: any) => {
      const values = option.values;
      return {
        ...option,
        values: values?.map((value: any) => {
          const valuePrice = value.original_price;
          const vendorOptionPrice = parseFloat(
            (valuePrice + (valuePrice * vendor_commission) / 100).toFixed(2)
          );

          return {
            ...value,
            original_price: valuePrice,
            price: vendorOptionPrice,
          };
        }),
      };
    });

    product.options = options;
    // token = access_token;

    /*  if (userType === "admin") {
      account = await User.findOne({
        _id: merchant,
        userType: "vendor",
      }).exec();
    } */

    const options_1 = {
      method: "POST",
      url: "https://api.salla.dev/admin/v2/products",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: product.name,
        price: product.price,
        product_type: product.product_type,
        quantity: product.quantity,
        description: product.description,
        cost_price: product.main_price,
        require_shipping: product.require_shipping,
        sku: product.sku,
        images: product.images,
        options: product.options,

        metadata_title,
        metadata_description,
      },
    };

    const jsonProduct = product.toJSON();
    console.log(token);
    /*     const valuesStock = new Array().concat(
      //@ts-ignore
      ...jsonProduct.options?.map((option: any) => option.values)
    );
    if (valuesStock.length > 100)
      throw new AppError("Values count should be smaller than 100", 400); */

    const { data: productResult } = await axios.request(options_1);
    // console.log(productResult);
    //    console.log(productResult.data.options);
    console.log(productResult.data.id);
    product.options = await Promise.all(
      // @ts-ignore
      jsonProduct.options?.map(async (option: OptionType, index: number) => {
        let obj: OptionType = option;
        const productOption = productResult.data.options[index];

        const values = await Promise.all(
          option.values.map(async (value: ValueType, idx: number) => {
            const optionValue = productOption?.values[idx];
            const mnp = getRandomInt(100000000000000, 999999999999999);
            const gitin = getRandomInt(10000000000000, 99999999999999);

            console.log(optionValue.id);
            // console.log(optionValue.id);

            return {
              ...value,
              mpn: mnp,
              gtin: gitin,
              // salla_value_id: value?.id,
              salla_value_id: optionValue?.id,
            };
          })
        );

        obj.salla_option_id = productOption?.id;
        obj.values = values;
      })
    );
    console.log(productResult.data.id);
    const finalOptions = await Promise.all(
      //@ts-ignore
      jsonProduct.options.map(async (option: OptionType, idx: number) => {
        const values = await Promise.all(
          option.values.map(async (optionValue: any, i: number) => {
            const variants =
              (await allVaraint(productResult.data.id, token)) || [];
            const variant = variants.find((item: any) =>
              item.related_option_values?.includes(optionValue.salla_value_id)
            );
            const mnp = getRandomInt(100000000000000, 999999999999999);
            const gitin = getRandomInt(10000000000000, 99999999999999);
            const { price, quantity, mpn, gtin, sku, id, sku_id } = optionValue;
            const barcode = [mnp, gitin].join("");
            if (!variant) return optionValue;
            let result = await UpdateProductVariant(
              variant.id,
              barcode,
              price,
              quantity,
              mnp,
              gitin,
              sku_id,
              access_token
            );
            if (!result) {
              result = await UpdateProductVariant(
                variant.id,
                barcode,
                price,
                quantity,
                mnp,
                gitin,
                sku_id,
                access_token
              );
            }
            return {
              ...optionValue,
              salla_variant_id: result?.data?.id,
            };
          })
        );
        return {
          ...option,
          values,
        };
      })
    );
    let aliexpressDoc = await AliExpressToken.findById(
      req.user.aliExpressToken
    );
    let tokenData = {
      aliExpressAccessToken: aliexpressDoc?.accessToken,
      aliExpressRefreshToken: aliexpressDoc?.refreshToken,
    };
    product.options = finalOptions;
    product.salla_product_id = productResult.data?.id;
    (async () =>
      await updateVariantFinalOption(product, access_token, tokenData))().then(
      async () => {
        /*         if (subscription.products_limit)
          subscription.products_limit = subscription.products_limit - 1; */
        // await Promise.all([product.save(), subscription.save()]);
        await product.save();
        res.status(200).json({
          message: "Product created successfully",
          result: {
            urls: productResult.data.urls || {},
          },
        });
      }
    );
  } catch (error: AxiosError | any) {
    const isAxiosError = error instanceof AxiosError;
    const values = error?.response?.data;
    console.log(error + "\n\n\n");
    console.log(values);
    next(
      isAxiosError ? new AppError("UnprocessableEntity " + values, 400) : error
    );
  }
}

function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
export const getProductVariants = async (
  id: any,
  pages: any,
  access_token: any
) => {
  console.log("access_token", access_token);
  console.log("access_token", access_token);
  console.log("id", id);
  // console.log("pages", pages);

  const options = {
    method: "GET",
    url: `https://api.salla.dev/admin/v2/products/${id}/variants?page=${pages}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };
  try {
    const { data } = await axios.request(options);
    console.log("variantsData",data)
    if (data.status === 200) {
      return data;
    } else return;
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data?.error);
    console.log(error?.response?.data?.error);
  }
};
const allVaraint = async (id: any, token: any) => {
  let all: any = [];
  await getProductVariants(id, 1, token).then(async (variantResult) => {
    if (variantResult) {
      if (variantResult?.pagination?.totalPages > 1) {
        for (let i = 0; i < variantResult.pagination.totalPages; i++) {
          const vr = await getProductVariants(id, i + 1, token);
          all.push(...vr.data);
        }
      } else {
        all.push(...variantResult.data);
      }
    }
  });
  return all;
};
export const UpdateProductVariant = async (
  variantId,
  barcode,
  price,
  stock_quantity,
  mpn,
  gtin,
  sku,
  token
) => {
  const options = {
    method: "PUT",
    url: `https://api.salla.dev/admin/v2/products/variants/${variantId}`,
    params: {
      sku,
      barcode,
      price,
      stock_quantity,
    },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: {
      sku,
      barcode,
      price,
      stock_quantity,
      mpn,
      gtin,
    },
  };
  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error: any) {
    if (error.response?.data?.error?.fields) {
      console.log(error.response?.data?.error.fields);
    } else {
      console.log(error.response?.data);
    }
  }
};
export const UpdateProductVariantSale = async (
  variantId,
  barcode,
  price,
  stock_quantity,
  mpn,
  gtin,
  sku,
  token,
  sale_price
) => {
  const options = {
    method: "PUT",
    url: `https://api.salla.dev/admin/v2/products/variants/${variantId}`,
    params: {
      sku,
      barcode,
      price,
      stock_quantity,
      sale_price,
    },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: {
      sku,
      barcode,
      price,
      stock_quantity,
      mpn,
      gtin,
      sale_price,
    },
  };
  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error: any) {
    if (error.response?.data?.error?.fields) {
      console.log(error.response?.data?.error.fields);
    } else {
      console.log(error.response?.data);
    }
  }
};
export const updateVariantFinalOption = async (
  product: ProductDocument,
  token: string,
  tokenData?: any
) => {
  const jsonProduct = product.toJSON();
  const data = await getProductVariants(product.salla_product_id, 1, token);
  if (data.pagination.totalPages > 1) {
    for (let i = 0; i < data.pagination.totalPages; i++) {
      const vr = await getProductVariants(
        product.salla_product_id,
        i + 1,
        token
      );
      const variants = vr.data.filter((e: any) => !e.sku);
      if (!variants.length) return;
      await Promise.all(
        variants.map(async (variant: any) => {
          if (!variant.sku) {
            const salla_option_ids = variant.related_option_values;
            const values = await Promise.all(
              jsonProduct.options.map(async (option: OptionType) => {
                const value = option.values.find((val) =>
                  salla_option_ids.includes(val?.salla_value_id)
                );
                return value;
              })
            );
            const getSkusId = async (values: any) => {
              const skus = await getProductSkus(
                product.original_product_id,
                tokenData
              );
              const keyWords = values.map((val: any) => val.name);
              await Promise.all(
                skus.map(async (sku: any) => {
                  const skusOptions =
                    sku.ae_sku_property_dtos.ae_sku_property_d_t_o;
                  const check =
                    sku.ae_sku_property_dtos.ae_sku_property_d_t_o.filter(
                      (property: any, idx: number) => {
                        if (property.property_value_definition_name) {
                          if (
                            keyWords.includes(
                              property.property_value_definition_name
                            )
                          )
                            return property;
                        } else {
                          if (
                            keyWords.includes(property.sku_property_value) ||
                            property.sku_property_name === "Ships From"
                          )
                            return property;
                        }
                      }
                    );
                  if (check.length === skusOptions.length) {
                    const optionValue = values.find(
                      (val: any) =>
                        val.name === sku.id.split(";")[0].split("#")[1] ||
                        val.sku === sku.id.split(";")[0]
                    );
                    const { price, quantity } = optionValue;
                    let mnp = getRandomInt(100000000000000, 999999999999999);
                    let gitin = getRandomInt(10000000000000, 99999999999999);
                    let barcode = [mnp, gitin].join("");
                    let result = await UpdateProductVariant(
                      variant.id,
                      barcode,
                      price,
                      quantity,
                      mnp,
                      gitin,
                      sku.sku_id,
                      token
                    );
                    while (!result) {
                      mnp = getRandomInt(100000000000000, 999999999999999);
                      gitin = getRandomInt(10000000000000, 99999999999999);
                      barcode = [mnp, gitin].join("");
                      result = await UpdateProductVariant(
                        variant.id,
                        barcode,
                        price,
                        quantity,
                        mnp,
                        gitin,
                        sku.sku_id,
                        token
                      );
                    }
                  }
                })
              );
            };
            await getSkusId(values);
          }
        })
      );
    }
  } else {
    const variants = data.data.filter((e: any) => !e.sku);
    if (!variants.length) return;
    await Promise.all(
      variants.map(async (variant: any) => {
        if (!variant.sku) {
          // console.log(product.id,variant.id)
          const salla_option_ids = variant.related_option_values;
          const values = await Promise.all(
            jsonProduct.options.map(async (option: OptionType) => {
              const value = option.values.find((val) =>
                salla_option_ids.includes(val.salla_value_id)
              );
              return value;
            })
          );
          const getSkusId = async (values: any) => {
            const skus = await getProductSkus(
              product.original_product_id,
              tokenData
            );
            console.log(values);
            const keyWords = values.map((val: any) => val.name);
            await Promise.all(
              skus.map(async (sku: any) => {
                const skusOptions =
                  sku.ae_sku_property_dtos.ae_sku_property_d_t_o;
                const check =
                  sku.ae_sku_property_dtos.ae_sku_property_d_t_o.filter(
                    (property: any, idx: number) => {
                      if (property.property_value_definition_name) {
                        if (
                          keyWords.includes(
                            property.property_value_definition_name
                          )
                        )
                          return property;
                      } else {
                        if (
                          keyWords.includes(property.sku_property_value) ||
                          property.sku_property_name === "Ships From"
                        )
                          return property;
                      }
                    }
                  );
                if (check.length === skusOptions.length) {
                  const optionValue = values.find(
                    (val: any) =>
                      val.name === sku.id.split(";")[0].split("#")[1] ||
                      val.sku === sku.id.split(";")[0]
                  );
                  const { price, quantity } = optionValue;
                  let mnp = getRandomInt(100000000000000, 999999999999999);
                  let gitin = getRandomInt(10000000000000, 99999999999999);
                  let barcode = [mnp, gitin].join("");
                  let result = await UpdateProductVariant(
                    variant.id,
                    barcode,
                    price,
                    quantity,
                    mnp,
                    gitin,
                    sku.sku_id,
                    token
                  );
                  while (!result) {
                    mnp = getRandomInt(100000000000000, 999999999999999);
                    gitin = getRandomInt(10000000000000, 99999999999999);
                    barcode = [mnp, gitin].join("");
                    result = await UpdateProductVariant(
                      variant.id,
                      barcode,
                      price,
                      quantity,
                      mnp,
                      gitin,
                      sku.sku_id,
                      token
                    );
                    console.log(result);
                  }
                }
              })
            );
          };
          await getSkusId(values);
        }
      })
    );
  }
};

export const getProductSkus = async (
  product_id: string | number,
  tokenData?: any
): Promise<any> => {
  try {
    const response = await MakeRequest(
      {
        ship_to_country: "SA",
        product_id: product_id,
        target_currency: "SAR",
        target_language: "AR",
        method: "aliexpress.ds.product.get",
        sign_method: "sha256",
      },
      tokenData
    );

    const aeResponse = response?.data;
    const result = aeResponse?.aliexpress_ds_product_get_response?.result;
    const errorMessage =
      aeResponse?.error_response?.msg ||
      "There is something went wrong while getting product details or maybe this product is not available for shipping to SA, try another product or contact support.";
    // console.log(result);
    if (!result) {
      console.log("notFound");
      console.log("lollolo");
    } else {
      const {
        ae_item_sku_info_dtos,
        ae_item_base_info_dto,
        ae_multimedia_info_dto,
      } = result;
      /* const chinaShippedProducts =
        ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.filter((product: any) => {
          let skus = product.ae_sku_property_dtos.ae_sku_property_d_t_o.some(
            (prop: any) => {
              return (
                prop.sku_property_name === "Ships From" &&
                prop.sku_property_value === "CHINA"
              );
            }
          );
          if (!skus.length) {
            skus = product.ae_sku_property_dtos.ae_sku_property_d_t_o;
          }
          return skus;
        }); */

      //me
      const chinaShippedProducts =
        ae_item_sku_info_dtos.ae_item_sku_info_d_t_o.filter((product: any) => {
          return product.ae_sku_property_dtos.ae_sku_property_d_t_o.some(
            (prop: any) => {
              return (
                prop.sku_property_name === "Ships From" &&
                prop.sku_property_value === "CHINA"
              );
            }
          );
        });
      //
      /*    console.log(chinaShippedProducts);
      console.log(result.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o); */
      // console.log(result);
      // return uniqBy(chinaShippedProducts, "sku_id");
      return uniqBy(
        result.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o,
        "sku_id"
      );
    }
  } catch (error: any) {
    console.error("Error fetching product SKUs:", error?.message);

    return [];
  }
};
