import { Router } from 'express';
import Grade from '../../models/Grade.js';
import Student from '../../models/Student.js';
import { isAdmin, verfiyAccessToken } from '../utils/middlewares.js';
import { checkSchema, validationResult } from 'express-validator';
import { gradeSchema } from '../utils/validation.js';
const router = Router();
router.get('/grades', verfiyAccessToken, isAdmin, async (req, res) => {
  try {
    const grades = await Grade.find().sort({ name: 1 });
    res.status(200).json({ grades });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});
router.post(
  '/grade',
  verfiyAccessToken,
  isAdmin,
  checkSchema(gradeSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({ error: result.array() });
    const { name, session } = req.body;
    try {
      const existingGrade = await Grade.findOne({ name });

      if (existingGrade) {
        return res.status(409).json({
          message: 'Grade already exists',
        });
      }
      const newGrade = await Grade.create({ name, session });
      res.status(201).json({ message: 'Grade created successfully', newGrade });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  },
);
router.put(
  '/updateGrade/:id',
  verfiyAccessToken,
  isAdmin,
  checkSchema(gradeSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({ error: result.array() });
    const { name, session } = req.body;
    const { id } = req.params;
    try {
      const updatedGrade = await Grade.findByIdAndUpdate(
        id,
        { name, session },
        { new: true, runValidators: true },
      );
      res.status(200).json({ message: 'Grade Updated', grade: updatedGrade });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  },
);
router.delete('grade/:id', verfiyAccessToken, isAdmin, async (req, res) => {
  const { id } = req.body;
  try {
    const deletedGrade = await Grade.findByIdAndDelete(id);
    if (!deletedGrade)
      return res.status(404).json({ message: 'Grade Not Found' });
    await Student.deleteMany({
      gradeId: id,
    });
    return res.status(200).json({
      message: 'Grade and its related students deleted successfully',
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid Grade ID format',
      });
    }

    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});

export default router;
