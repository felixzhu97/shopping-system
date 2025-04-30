import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from 'shared';

export interface UserDocument extends Document, Omit<User, 'id'> {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiration: { type: String, required: true },
    cvv: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 密码加密中间件
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 转换 _id 为 id
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password; // 不返回密码
  },
});

export default mongoose.model<UserDocument>('User', UserSchema);
