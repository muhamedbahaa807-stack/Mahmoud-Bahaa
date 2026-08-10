import { Router } from 'express';
import User from '../../models/User.js';
import { comparePass, hashing } from '../helpers/hashPass.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { checkSchema, validationResult } from 'express-validator';
import {
  changePassSchema,
  loginschema,
  updateProfileSchema,
} from '../utils/validation.js';
import { verfiyAccessToken } from '../utils/middlewares.js';
import jwt from 'jsonwebtoken';
const router = Router();
router.post('/signIN', checkSchema(loginschema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error(result.array()[0].msg);
    error.status = 400;
    throw error;
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  const ismatching = comparePass(password, user.password);
  if (!ismatching) {
    const error = new Error('Password is wrong');
    error.status = 404;
    throw error;
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 60000 * 60 * 24,
  });
  res.status(200).json({ message: 'LogIN succesfully', user, accessToken });
});
router.get('/profile', verfiyAccessToken, (req, res) => {
  res.status(200).json(req.user);
});
router.put(
  '/updateProfile',
  checkSchema(updateProfileSchema),
  verfiyAccessToken,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error(result.array()[0].msg);
      error.status = 400;
      throw error;
    }
    const { email, phone, name } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true, runValidators: true },
    ).select('-password');
    if (!updatedUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  },
);
router.put(
  '/change-password',
  checkSchema(changePassSchema),
  verfiyAccessToken,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error(result.array()[0].msg);
      error.status = 400;
      throw error;
    }
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatching = comparePass(currentPassword, user.password);

    if (!isMatching) {
      const error = new Error('Current password is incorrect');
      error.status = 400;
      throw error;
    }

    if (currentPassword === newPassword) {
      const error = new Error('New password must be different');
      error.status = 400;
      throw error;
    }

    const hashedPassword = hashing(newPassword);

    await User.findByIdAndUpdate(
      req.user._id,
      {
        password: hashedPassword,
      },
      {
        returnDocument: 'after',
      },
    );

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  },
);
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);

  return res.status(200).json({
    accessToken,
  });
});
router.post('/logOut', (req, res) => {
  res.clearCookie('refreshToken');

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});
export default router;
