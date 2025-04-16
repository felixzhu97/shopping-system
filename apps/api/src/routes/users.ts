import express from "express";
import {
  register,
  login,
  getUserById,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

// 用户注册
router.post("/register", register);

// 用户登录
router.post("/login", login);

// 获取用户信息
router.get("/:id", getUserById);

// 更新用户信息
router.put("/:id", updateUser);

export default router;
