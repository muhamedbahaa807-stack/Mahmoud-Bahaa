import { Router } from 'express';
import Grade from '../../models/Grade.js';
import Student from '../../models/Student.js';
import { isAdmin, verfiyAccessToken } from '../utils/middlewares.js';
import { checkSchema, validationResult } from 'express-validator';
import { gradeSchema } from '../utils/validation.js';
import mongoose from 'mongoose';
const router = Router();
router.get('/grades', verfiyAccessToken, isAdmin, async (req, res) => {
  const grades = await Grade.find().sort({ name: 1 });
  res.status(200).json({ grades });
});

router.post(
  '/grade',
  checkSchema(gradeSchema),
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error(result.array()[0].msg);
      error.status = 400;
      throw error;
    }
    const { name, session } = req.body;
    const existingGrade = await Grade.findOne({ name });

    if (existingGrade) {
      const error = new Error('Grade already exists');
      error.status = 409;
      throw error;
    }
    const newGrade = await Grade.create({ name, session });
    res.status(201).json({ message: 'Grade created successfully', newGrade });
  },
);
router.put(
  '/updateGrade/:id',
  checkSchema(gradeSchema),
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error(result.array()[0].msg);
      error.status = 400;
      throw error;
    }
    const { name, session } = req.body;
    const { id } = req.params;
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      { name, session },
      { new: true, runValidators: true },
    );
    if (!updatedGrade) {
      const error = new Error('Grade not found');
      error.status = 400;
      throw error;
    }
    res.status(200).json({ message: 'Grade Updated', grade: updatedGrade });
  },
);
router.delete('/grade/:id', verfiyAccessToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid department ID format');
    error.status = 400;
    throw error;
  }
  const deletedGrade = await Grade.findByIdAndDelete(id);
  if (!deletedGrade) {
    const error = new Error('Grade Not Found');
    error.status = 404;
    throw error;
  }
  await Student.deleteMany({
    gradeId: id,
  });
  res.status(200).json({
    message: 'Grade and its related students deleted successfully',
  });
});

export default router;
