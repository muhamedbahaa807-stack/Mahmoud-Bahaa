import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export const verfiyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Invalid Token',
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admins only.' });
};

export const errorHandler = (err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || 'internal server error' });
};
export const notFound = (req, res) => {
  const error = new Error('Not Found');
  error.status = 404;
  throw error;
};
