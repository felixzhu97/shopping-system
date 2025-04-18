import mongoose, { Schema, Document } from 'mongoose';
import { Product as SharedProduct } from 'shared';

// 使用shared包中的Product类型，但不包含id字段，因为MongoDB会自动生成_id
export type ProductType = Omit<SharedProduct, 'id'>;

export interface ProductDocument extends Document, ProductType {
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
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    originalPrice: { type: Number },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 转换 _id 为 id
ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<ProductDocument>('Product', ProductSchema);
