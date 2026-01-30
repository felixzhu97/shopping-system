import { UserLogin, UserResetPassword } from 'types';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../index';

export const register = async (req: any, res: any) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400 as number).json({ message: 'Email or phone is already in use' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400 as number).json({ message: 'Invalid email address' });
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
    res.status(500 as number).json({ message: 'Failed to register user' });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { emailOrPhone, password } = req.body as UserLogin;
    if (!emailOrPhone || !password) {
      return res.status(400 as number).json({ message: 'Missing credentials' });
    }

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });

    if (!user) {
      return res.status(401 as number).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await (user as any).comparePassword(password);

    if (!isValidPassword) {
      return res.status(401 as number).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = getJwtSecret();
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      token,
    };

    res.status(200 as number).json(userResponse);
  } catch (error) {
    console.error('Failed to login user:', error);
    res.status(500 as number).json({ message: 'Failed to login user' });
  }
};

export const getUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404 as number).json({ message: 'User not found' });
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
    res.status(500 as number).json({ message: 'Failed to fetch user' });
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
      return res.status(404 as number).json({ message: 'User not found' });
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400 as number).json({ message: 'Phone is already in use' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400 as number).json({ message: 'Email is already in use' });
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
    res.status(500 as number).json({ message: 'Failed to update user' });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const { emailOrPhone, newPassword } = req.body as UserResetPassword;

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) {
      return res.status(404 as number).json({ message: 'Email or phone not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200 as number).json({ message: 'Password updated' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500 as number).json({ message: 'Failed to reset password' });
  }
};

export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200 as number).json(users);
  } catch (error) {
    res.status(500 as number).json({ message: 'Failed to load users' });
  }
};
