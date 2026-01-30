import express from 'express';
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  resetPassword,
} from '../controllers/userController';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/', adminAuth, getAllUsers);

router.get('/:id', getUserById);

router.put('/:id', updateUser);

router.post('/reset-password', resetPassword);

export default router;
