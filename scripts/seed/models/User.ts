import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type SeedUser = {
  email: string;
  password: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  paymentMethod?: string;
};

export type SeedUserDocument = Document & SeedUser;

const userSchema = new Schema<SeedUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    paymentMethod: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const UserModel =
  mongoose.models.User ?? mongoose.model<SeedUserDocument>('User', userSchema);

export default UserModel;
