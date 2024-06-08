import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
interface ImageType {
  original: string;
  thumbnail: string;
  default: boolean;
  alt: string;
}

interface ValueType {
  name: string;
  price: number;
  original_price: number;
  quantity: number;
  is_default: boolean;
  property_id: number;
  sku_id: number;
  salla_value_id?: string;
  salla_variant_id?: string;
  mpn?: string | number;
  gtin?: string | number;
  display_value: string;
  sku: string;
  vat: boolean;
}

interface OptionType {
  name: string;
  display_type: string;
  values: ValueType[];
  salla_option_id: string;
}

interface ShippingAttributes {
  name: string;
  price: number;
  shipping_method?: string;
  service_name?: string;
  serviceName?: string;
  estimated_delivery_time?: string;
  tracking_available?: boolean;
  freight?: { cent?: string; currency?: any; currency_code?: any };
}

interface ProductSchema {
  name: string;
  description: string;
  price: number;
  main_price: number;
  vendor_commission: number;
  vendor_price: number;
  quantity: number;
  sku: string;
  images: SchemaDefinitionProperty<ImageType[] | null> | ImageType[];
  options: SchemaDefinitionProperty<OptionType[] | null>;
  metadata_title: string;
  metadata_description: string;
  product_type: string;
  original_product_id: number | string;
  salla_product_id: number | string | undefined;
  merchant: SchemaDefinitionProperty<Types.ObjectId>;
  require_shipping: boolean;
  shipping: ShippingAttributes | ShippingAttributes[];
  sku_id: string;
  vat: any;
  // category_id?: number;
  // category_name?: string;
  first_level_category_name?: string;
  country_code?: string;
  second_level_category_name?: string;
  target_sale_price?: string | number;
  target_original_price?: string | number;
  variantsArr?: any;
  commissionPercentage?: boolean;
  showDiscountPrice?: boolean;
  discountPrice?: number;
  categoriesSalla?: number[];

  sallaTags?: { name: string; id: number }[];

  shippingIncludedChoice?: boolean;
  shippingIncludedChoiceIndex?: number;
  // checkboxesSelected?: any;
  // productEditFormOrigin?: boolean;
  shippingAvailable?: boolean;
  productValuesNumber?: number;
  shippingFee?: number;
  defaultImage?: string;
  highestOptionValue?:number
}
interface IRelativeOption{
  property_value_definition_name: string;
  property_value_id: number;
  sku_image?: string;
  sku_property_id: number;
  sku_property_name: string;
  sku_property_value: string;
}
interface IVariant{
  id: string;
  offer_bulk_sale_price: string;
  offer_sale_price?: string;
  profitTypeValue: null | string; 
  relativeOptions: Array<IRelativeOption>;
  sku_available_stock: number;
  sku_code: string;
  sku_id: string;
  sku_price: string;
  sku_stock: boolean;
  commission?:number
}
interface ProductDocument extends Document, ProductSchema {}

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
      },  serviceName: {
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
  highestOptionValue: { type:Number, default: 0, select: false },
};

const schema = new Schema<ProductSchema>(options, {
  timestamps: true,
  toObject: { virtuals: true },
});
schema.index({ "$**": "text" });
schema.plugin(mongoosePaginate);

schema.pre("save", function (next) {
  console.log("SHIPPINGGGGGGGGGGGGGGGGGGGGGGGG",this.shipping)
  if (this.isModified("options")) {
    let options: any = this.options;

    if (Array.isArray(options) && !options?.[0]?.name) {
      this.productValuesNumber = 0;
    }
    let count = 1;
    if (Array.isArray(options) && options.length > 0) {
      options?.forEach((option: any) => {
        count *= option.values.length;
      });
      if (count >= 1) {
        this.productValuesNumber = count;
      } else {
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
    } else if (
      typeof shipIndex == "number" &&
      shipIndex >= 0 &&
      Array.isArray(shipping) &&
      shipping?.length > 0
    ) {
      this.shipping = this.shipping.map((shipping: any, index: number) => {
        let checked = false;
        if (index == shipIndex) {
          checked = true;
        }
        return { ...shipping, checked };
      });
      let fee: any = shipping?.[shipIndex]?.freight?.cent || 0;
      if (fee !== 0) {
        fee /= 100;
      }

      if (fee !== undefined && typeof fee == "number" && fee !== 0) {
        this.shippingFee = fee;
      }
    }
  } else {
    this.shippingFee = 0;
    this.shippingAvailable = false;
  }

  if (this.isModified("images")) {
    if (Array.isArray(this.images) && this.images.length > 0) {
      const image = this.images[0] as ImageType;
      this.defaultImage = image.original;
    }
  }

  if(this.isModified("options") || this.isModified("variantsArr")){
    console.log("THIS variantsArr IS MODIFIEDDDDDD")
    console.log("THIS variantsArr IS MODIFIEDDDDDD")
    console.log("THIS variantsArr IS MODIFIEDDDDDD")
    console.log("THIS variantsArr IS MODIFIEDDDDDD")
    console.log("THIS variantsArr IS MODIFIEDDDDDD")
    console.log("THIS variantsArr IS MODIFIEDDDDDD")
    let highestValue:number = 0
for (let i =0 ;i<this.variantsArr.length;i++){
  let currVariant  :IVariant=this.variantsArr?.[0]
  let price = Number(currVariant.offer_sale_price)
  highestValue = Math.max(price, highestValue);
}
this.highestOptionValue = highestValue
console.log("highestValue",highestValue)
console.log("highestOptionValue",this.highestOptionValue)
  }
  next();
});

const Product = model<ProductSchema, PaginateModel<ProductDocument>>(
  "Product",
  schema,
  "products"
);

export {
  Product,
  ProductSchema,
  ProductDocument,
  ImageType,
  ValueType,
  OptionType,
};
