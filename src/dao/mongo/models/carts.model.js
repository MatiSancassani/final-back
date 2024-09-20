import { mongoose, Schema, SchemaTypes } from "mongoose";

mongoose.pluralize(null);

const collection = "cart";

const cartsSchema = new mongoose.Schema(
  {
    // user_id: {type:Schema.Types.ObjectId, required: true, ref: ''}
    products: [
      {
        _id: false,
        id: {
          type: SchemaTypes.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          required: [true, "La cantidad del producto es obligatoria"],
        },
      },
    ],
  },
  { versionKey: false }
);

const cartModel = mongoose.model(collection, cartsSchema);

export default cartModel;
