import mongoose, { Schema, Document } from 'mongoose';
import { Payment } from 'shared';

export interface PaymentType extends Payment {
  userId: string;
}

export interface PaymentDocument extends Document, PaymentType {}

const PaymentSchema: Schema = new Schema(
  {
    // ------User------
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    // ------Address------
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    // ------Payment------
    paymentMethod: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiration: { type: String, required: true },
    cvv: { type: String, required: true },
  },
  { timestamps: true }
);

// 转换 _id 为 id
PaymentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<PaymentDocument>('Payment', PaymentSchema);
