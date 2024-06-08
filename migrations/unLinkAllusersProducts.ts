// npx ts-node migrantions/file.ts
// to run ts node without compiling to js or (tsc)

import { Product } from "../src/models/product.model";
import axios from "axios";
import { createAccessToken } from "../src/utils/authHelperFunction";
import User from "../src/models/user.model";
import fs from "fs";
import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config({ path: ".env" });
async function UnLinkAllUsersProducts() {
  await mongoose.connect(process.env.DB_URL!);
  console.log('db',process.env.DB_URL)

  const pageSize = 200;
  let page = 1;
  let products;

  do {
    // Get 100 products
    const result = await Product.paginate({}, { page, limit: pageSize });
    products = result.docs;

    // Loop through each product
    for (const product of products) {
      let user = await User.findById(product.merchant);
      if (!user) {
        return;
      }
      console.log(`Deleting product ${product._id} for user ${user.id}`)
      let token = await createAccessToken(user.id);
      console.log("token", token)
      let options = {
        url: `http://localhost:10000/api/v1/aliexpress/product/deleteProduct/${product._id}`,
        // baseUrl: "http://localhost:10000/api/v1/aliexpress",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      let res = await axios.request(options).catch((error) => console.error(error));      
      fs.appendFile(
        "deleteAllProducts.txt",
        `Product ${product._id} deleted with status ${res?.status}\n`,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    }

    // Wait for 5 minutes
    await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));

    page++;
  } while (products.length === pageSize);

  await mongoose.connection.close()
}

UnLinkAllUsersProducts()
  .then(() => {
    console.log("Success");
  })
  .catch((error) => console.error("Error"));