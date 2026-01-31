import mongoose, { Document, Schema } from 'mongoose';

export type Product = {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  modelKey?: string;
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
};

export type ProductDocument = Document & Product;

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    modelKey: { type: String },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    originalPrice: { type: Number },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product ?? mongoose.model<ProductDocument>('Product', ProductSchema);

