import mongoose, { Schema, Document } from "mongoose";

export interface UserType {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: "user" | "admin";
}

export interface UserDocument extends Document, Omit<UserType, "id"> {
  password: string;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// 转换 _id 为 id
UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password; // 不返回密码
  },
});

export default mongoose.model<UserDocument>("User", UserSchema);
