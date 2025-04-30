import mongoose, { Schema, Document } from 'mongoose';
import { IAddress, IPaymentMethod } from './User';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IPaymentDetails {
  method: IPaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  paidAt?: Date;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IAddress;
  paymentDetails: IPaymentDetails;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    paymentDetails: {
      method: {
        type: {
          type: String,
          required: true,
          enum: ['credit-card', 'alipay', 'wechat'],
        },
        cardNumber: {
          type: String,
          select: false,
        },
        expiration: {
          type: String,
          select: false,
        },
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      paidAt: {
        type: Date,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
