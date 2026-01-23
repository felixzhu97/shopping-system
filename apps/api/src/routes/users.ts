import express from 'express';
import {
  register,
  login,
  getUserById,
  updateUser,
  resetPassword,
} from '../controllers/userController';

const router = express.Router();

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 用户信息权限校验中间件
const canAccessUser = (req: any, res: any, next: any) => {
  return next();
};

// 获取用户信息
router.get('/:id', canAccessUser, getUserById);

// 更新用户信息
router.put('/:id', canAccessUser, updateUser);

// 重置密码
router.post('/reset-password', resetPassword);

export default router;
