import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  paymentMethod: 'credit-card' | 'alipay' | 'wechat';
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit-card', 'alipay', 'wechat'],
    },
    cardNumber: {
      type: String,
      required: function (this: IPayment) {
        return this.paymentMethod === 'credit-card';
      },
    },
    expiration: {
      type: String,
      required: function (this: IPayment) {
        return this.paymentMethod === 'credit-card';
      },
    },
    cvv: {
      type: String,
      required: function (this: IPayment) {
        return this.paymentMethod === 'credit-card';
      },
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
PaymentSchema.index({ userId: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
