import { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

// 注册新用户
export const register = async (req: any, res: any) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // 检查邮箱或手机号是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400 as number).json({ message: '用户名或邮箱已被使用' });
    }

    // 创建新用户
    const user = new User({
      email,
      password, // 密码会在model中间件中自动加密
      role: 'user', // 默认角色
      fullName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      phone,
    });

    await user.save();

    // 不返回密码信息
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };

    res.status(201 as number).json(userResponse);
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500 as number).json({ message: '用户注册失败' });
  }
};

// 用户登录
export const login = async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;

    // 构造$or条件，避免null，指定any类型
    const orConditions: any[] = [];
    if (username) orConditions.push({ username });
    if (email) orConditions.push({ email });

    const user = await User.findOne(orConditions.length > 0 ? { $or: orConditions } : {});

    if (!user) {
      return res.status(401 as number).json({ message: '用户名或密码错误' });
    }

    // 验证密码 - 修复TypeScript类型问题
    const isValidPassword = await (user as any).comparePassword(password);

    if (!isValidPassword) {
      return res.status(401 as number).json({ message: '用户名或密码错误' });
    }

    // 不返回密码信息
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };

    res.status(200 as number).json(userResponse);
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500 as number).json({ message: '用户登录失败' });
  }
};

// 获取用户信息
export const getUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404 as number).json({ message: '用户不存在' });
    }

    // 明确返回 address 字段
    let userObj: any = user.toObject();
    if (!userObj.address) {
      userObj.address = {
        firstName: '',
        lastName: '',
        company: '',
        street: '',
        apt: '',
        zip: '',
        city: '',
        country: '',
        phone: '',
      };
    }

    res.status(200 as number).json(userObj);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500 as number).json({ message: '获取用户信息失败' });
  }
};

// 更新用户信息
export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { email, phone, address } = req.body;

    // 检查用户是否存在
    const user = await User.findById(id);

    if (!user) {
      return res.status(404 as number).json({ message: '用户不存在' });
    }

    // 检查邮箱和手机号是否被其他用户使用
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

    // 更新用户信息和地址
    const updateData: any = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      '-password'
    );

    res.status(200 as number).json(updatedUser);
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500 as number).json({ message: '更新用户信息失败' });
  }
};
