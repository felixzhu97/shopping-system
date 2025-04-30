import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
  {
    timestamps: true,
  }
);

// 添加索引
AddressSchema.index({ userId: 1 });

export default mongoose.model<IAddress>('Address', AddressSchema);
