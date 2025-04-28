import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from 'shared';

export interface CartItemType {
  productId: string;
  quantity: number;
}

export interface OrderType {
  id?: string;
  userId: string;
  items: CartItemType[];
  totalAmount: number;
  status: OrderStatus;
}

export interface OrderDocument extends Document, Omit<OrderType, 'id'> {}

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

const OrderSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// 转换 _id 为 id
OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<OrderDocument>('Order', OrderSchema);
