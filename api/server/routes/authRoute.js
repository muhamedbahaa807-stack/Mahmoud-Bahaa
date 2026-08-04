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
router.post('/signIN', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const ismatching = comparePass(password, user.password);
    if (!ismatching) {
      return res.status(404).json({ message: 'Password is wrong' });
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
  } catch (err) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});
router.get('/profile', verfiyAccessToken, (req, res) => {
  res.status(200).json(req.user);
});
router.put('/updateProfile', verfiyAccessToken, async (req, res) => {
  const { email, phone, name } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true, runValidators: true },
    ).select('-password');
    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});
router.put('/change-password', verfiyAccessToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatching = comparePass(currentPassword, user.password);

    if (!isMatching) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password must be different',
      });
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
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      accessToken,
    });
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired refresh token',
    });
  }
});
router.post('/logOut', (req, res) => {
  res.clearCookie('refreshToken');

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});
export default router;
