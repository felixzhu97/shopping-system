import mongoose, { Document, Schema } from 'mongoose';

export type OrderItemSeed = {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description?: string;
};

export type SeedOrder = {
  userId: mongoose.Types.ObjectId;
  items: OrderItemSeed[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: 'alipay' | 'wechat' | 'credit-card';
};

export type SeedOrderDocument = Document & SeedOrder;

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    description: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<SeedOrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['alipay', 'wechat', 'credit-card'],
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const OrderModel =
  mongoose.models.Order ?? mongoose.model<SeedOrderDocument>('Order', orderSchema);

export default OrderModel;
