import { Product } from "../../../../models/product.model";
import MakeRequest from "../../features/Request";

export default async function fetchCategoryName({
  category_id,
  original_product_id,
  metadata_title,
  tokenInfo,
}: any) {
  console.log(category_id, original_product_id, metadata_title);
  /*    const product = await Product.findOne({
      original_product_id,
    }); */
  /*     if (!product) {
      console.log("No product found with the given criteria");
      return;
    } */
  /* console.log(product); */
  let data = MakeRequest(
    {
      categoryId: category_id,
      language: "en",
      method: "aliexpress.ds.category.get",
      sign_method: "sha256",
    },
    tokenInfo
  )
    .then(async (response: any) => {
      /*      console.log(
          response.data.aliexpress_ds_category_get_response.result.categories[0]
            .category_name
        ); */
      /*  console.log(
          response.data.aliexpress_ds_category_get_response.resp_result
            .categories.category[0].category_name
        ); */
      let category_name =
        response.data.aliexpress_ds_category_get_response.resp_result.result
          .categories.category[0].category_name;
      console.log(category_name);

      return category_name;
    })
    .catch((err) => {
      console.log(err);
      return "null";
    });

  return data;
}
