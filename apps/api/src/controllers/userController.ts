import { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

// 注册新用户
export const register = async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户名或邮箱是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400 as number).json({ message: '用户名或邮箱已被使用' });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password, // 密码会在model中间件中自动加密
      role: 'user', // 默认角色
    });

    await user.save();

    // 不返回密码信息
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
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
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401 as number).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401 as number).json({ message: '用户名或密码错误' });
    }

    // 不返回密码信息
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
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

    res.status(200 as number).json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500 as number).json({ message: '获取用户信息失败' });
  }
};

// 更新用户信息
export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    // 检查用户是否存在
    const user = await User.findById(id);

    if (!user) {
      return res.status(404 as number).json({ message: '用户不存在' });
    }

    // 检查用户名和邮箱是否被其他用户使用
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400 as number).json({ message: '用户名已被使用' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400 as number).json({ message: '邮箱已被使用' });
      }
    }

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(id, { username, email }, { new: true }).select(
      '-password'
    );

    res.status(200 as number).json(updatedUser);
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500 as number).json({ message: '更新用户信息失败' });
  }
};
