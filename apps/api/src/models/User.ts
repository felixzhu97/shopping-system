import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface IPaymentMethod {
  type: 'credit-card' | 'alipay' | 'wechat';
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin';
  addresses: IAddress[];
  paymentMethods: IPaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema({
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
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const PaymentMethodSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['credit-card', 'alipay', 'wechat'],
  },
  cardNumber: {
    type: String,
    required: function (this: IPaymentMethod) {
      return this.type === 'credit-card';
    },
    select: false, // 默认不返回卡号
  },
  expiration: {
    type: String,
    required: function (this: IPaymentMethod) {
      return this.type === 'credit-card';
    },
    select: false, // 默认不返回过期日期
  },
  cvv: {
    type: String,
    required: function (this: IPaymentMethod) {
      return this.type === 'credit-card';
    },
    select: false, // 默认不返回CVV
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 默认不返回密码
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [AddressSchema],
    paymentMethods: [PaymentMethodSchema],
  },
  {
    timestamps: true,
  }
);

// 添加索引
UserSchema.index({ email: 1 }, { unique: true });

// 密码加密中间件
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

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

// 设置默认地址的方法
UserSchema.methods.setDefaultAddress = async function (addressId: string) {
  this.addresses.forEach((address: any) => {
    address.isDefault = address._id.toString() === addressId;
  });
  await this.save();
};

// 设置默认支付方式的方法
UserSchema.methods.setDefaultPaymentMethod = async function (paymentMethodId: string) {
  this.paymentMethods.forEach((method: any) => {
    method.isDefault = method._id.toString() === paymentMethodId;
  });
  await this.save();
};

export default mongoose.model<IUser>('User', UserSchema);
