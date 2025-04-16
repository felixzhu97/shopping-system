import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";

// 注册新用户
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户名和邮箱是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "用户名或邮箱已存在" });
    }

    // 创建新用户 (实际项目中应加密密码)
    const newUser = new User({
      username,
      email,
      password, // 实际项目中应使用 bcrypt 等加密
      role: "user",
    });

    const savedUser = await newUser.save();

    // 不返回密码
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("用户注册失败:", error);
    res.status(500).json({ message: "用户注册失败" });
  }
};

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 验证密码 (实际项目中应比较加密后的密码)
    if (user.password !== password) {
      return res.status(401).json({ message: "密码错误" });
    }

    // 不返回密码
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      message: "登录成功",
      user: userResponse,
    });
  } catch (error) {
    console.error("用户登录失败:", error);
    res.status(500).json({ message: "用户登录失败" });
  }
};

// 获取用户信息
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 不返回密码
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({ message: "获取用户信息失败" });
  }
};

// 更新用户信息
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 检查用户名或邮箱是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "用户名已存在" });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "邮箱已存在" });
      }
    }

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );

    // 不返回密码
    const userResponse = {
      id: updatedUser?._id,
      username: updatedUser?.username,
      email: updatedUser?.email,
      role: updatedUser?.role,
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({ message: "更新用户信息失败" });
  }
};
