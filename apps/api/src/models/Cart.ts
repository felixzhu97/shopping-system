import mongoose, { Schema, Document } from 'mongoose';
import { CartItem } from 'shared';

export interface CartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: CartItem[];
}

const CartItemSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const CartSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

// 转换 _id 为 id
CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<CartDocument>('Cart', CartSchema);
