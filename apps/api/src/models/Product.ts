import mongoose, { Schema, Document } from "mongoose";

export interface ProductType {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface ProductDocument extends Document, Omit<ProductType, "id"> {
  // MongoDB 会自动添加 _id，所以我们不需要 id 字段
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// 转换 _id 为 id
ProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<ProductDocument>("Product", ProductSchema);
