import axios, { AxiosError } from "axios";
import AppError from "../../../../utils/appError";
import { Product, ProductSchema } from "../../../../models/product.model";
import { pick } from "lodash";
import SallaToken from "../../../../models/SallaTokenModel";
import { NextFunction, Request, Response } from "express";
const attachShippingInfoToProuct = async (
  docId: any,
  productId: any,
  req: any
) => {
  setTimeout(async () => {
    try {
      const product = await Product.findById(docId);
      const token = req.headers["authorization"];
      console.log(productId);
      if (product) {
        const getShippingInfo = {
          url: process.env.Backend_Link + "aliexpress/getShippingDetails",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          data: {
            product_id: productId,
          },
        };
        const resp = await axios.request(getShippingInfo);
        console.log(resp.data.shipping);
        product.shipping = resp.data.shipping;
        await product.save();
      }
    } catch (error: any) {
      console.log(error?.response?.data);
    }
  }, 2000);
};
export async function CreateAndSaveProduct(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { role, _id } = req.user;

    const {
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
      variantsArr,
    } = req.body;
    console.log(req.body.variantsArr);
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
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
    console.log('vendor_commission',vendor_commission)
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
      first_level_category_name,
      second_level_category_name,
      target_sale_price,
      target_original_price,
      variantsArr,
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
    // let { category_id, category_name } = req.body;
    // product.category_name = category_names;
    // product.category_id = category_id;
    const jsonProduct = product.toJSON();
    /*     const valuesStock = new Array().concat(
      //@ts-ignore
      ...jsonProduct.options?.map((option: any) => option.values)
    ); */
    /*     if (valuesStock.length > 100)
      throw new AppError("Values count should be smaller than 100", 400); */
    await product.save();
    res.status(201).json({ product, success: true });

    attachShippingInfoToProuct(
      product._id.toString(),
      product.original_product_id,
      req
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
