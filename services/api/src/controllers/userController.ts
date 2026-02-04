import { UserLogin, UserResetPassword } from 'types';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../index';

export const register = async (req: any, res: any) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400 as number).json({ message: '邮箱或手机号已被使用' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400 as number).json({ message: '请输入有效的邮箱地址' });
    }

    const user = new User({
      email,
      password,
      role: 'user',
      firstName,
      lastName,
      phone,
    });

    await user.save();

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };

    res.status(201 as number).json(userResponse);
  } catch (error) {
    console.error('Failed to register user:', error);
    res.status(500 as number).json({ message: '注册失败' });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { emailOrPhone, password } = req.body as UserLogin;
    if (!emailOrPhone || !password) {
      return res.status(400 as number).json({ message: '缺少账号或密码' });
    }

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });

    if (!user) {
      return res.status(401 as number).json({ message: '账号或密码错误，请重新输入' });
    }

    const isValidPassword = await (user as any).comparePassword(password);

    if (!isValidPassword) {
      return res.status(401 as number).json({ message: '账号或密码错误，请重新输入' });
    }

    const jwtSecret = getJwtSecret();
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });
    const adminSecret = process.env.ADMIN_SECRET || '';

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      adminSecret,
      token,
    };

    res.status(200 as number).json(userResponse);
  } catch (error) {
    console.error('Failed to login user:', error);
    res.status(500 as number).json({ message: '登录失败' });
  }
};

export const getUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404 as number).json({ message: '用户不存在' });
    }

    const userObj: any = user.toObject();
    userObj.address = userObj.address ?? '';
    userObj.city = userObj.city ?? '';
    userObj.province = userObj.province ?? '';
    userObj.postalCode = userObj.postalCode ?? '';
    userObj.paymentMethod = userObj.paymentMethod ?? '';

    res.status(200 as number).json(userObj);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500 as number).json({ message: '获取用户信息失败' });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const {
      email,
      phone,
      firstName,
      lastName,
      address,
      city,
      province,
      postalCode,
      paymentMethod,
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404 as number).json({ message: '用户不存在' });
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400 as number).json({ message: '手机号已被使用' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400 as number).json({ message: '邮箱已被使用' });
      }
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (province) updateData.province = province;
    if (postalCode) updateData.postalCode = postalCode;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      '-password'
    );

    res.status(200 as number).json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500 as number).json({ message: '更新用户信息失败' });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const { emailOrPhone, newPassword } = req.body as UserResetPassword;

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) {
      return res.status(404 as number).json({ message: '邮箱或手机号不存在' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200 as number).json({ message: '密码更新成功' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500 as number).json({ message: '重置密码失败' });
  }
};

export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200 as number).json(users);
  } catch (error) {
    res.status(500 as number).json({ message: '获取用户列表失败' });
  }
};
