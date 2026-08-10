import { Router } from 'express';
import mongoose from 'mongoose';
import { isAdmin, verfiyAccessToken } from '../utils/middlewares.js';
import { checkSchema, validationResult } from 'express-validator';
import Student from '../../models/Student.js';
import Grade from '../../models/Grade.js';
import { studentSchema } from '../utils/validation.js';
const router = Router();
router.get('/students', verfiyAccessToken, isAdmin, async (req, res) => {
  const students = await Student.find();
  return res.status(200).json({ students });
});
router.get(
  '/grades/:id/students',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid Grade ID format');
      error.status = 400;
      throw error;
    }
    const grade = await Grade.findById(id);

    if (!grade) {
      const error = new Error('Grade not found');
      error.status = 404;
      throw error;
    }

    const students = await Student.find({ gradeId: id }).sort({ xp: -1 });

    return res.status(200).json({ students });
  },
);
router.post(
  '/grades/:id/students',
  verfiyAccessToken,
  checkSchema(studentSchema),
  isAdmin,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error(result.array()[0].msg);
      error.status = 400;
      throw error;
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid Grade ID format');
      error.status = 400;
      throw error;
    }
    const { name, phones, studying } = req.body;
    const grade = await Grade.findById(id);

    if (!grade) {
      const error = new Error('Grade not found');
      error.status = 404;
      throw error;
    }
    const isExist = await Student.findOne({
      'phones.number': {
        $in: phones.map((phone) => phone.number),
      },
    });
    if (isExist) {
      const error = new Error('Phone number already exists');
      error.status = 409;
      throw error;
    }
    const newStudent = await Student.create({
      name,
      phones,
      studying,
      gradeId: id,
    });
    res.status(201).json({ message: 'Student created', Student: newStudent });
  },
);
router.put(
  '/students/Update/:id',
  verfiyAccessToken,
  checkSchema(studentSchema),
  isAdmin,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error(result.array()[0].msg);
      error.status = 400;
      throw error;
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid ID format');
      error.status = 400;
      throw error;
    }
    const { name, phones, studying } = req.body;
    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }
    const isExist = await Student.findOne({
      _id: { $ne: id },
      'phones.number': {
        $in: phones.map((phone) => phone.number),
      },
    });
    if (isExist) {
      const error = new Error('Phone number already exists');
      error.status = 409;
      throw error;
    }
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, phones, studying },
      { new: true, runValidators: true },
    );
    res
      .status(200)
      .json({ message: 'Student updated', Student: updatedStudent });
  },
);
router.delete('/students/:id', verfiyAccessToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid student ID format');
    error.status = 400;
    throw error;
  }

  const deletedStudent = await Student.findByIdAndDelete(id);

  if (!deletedStudent) {
    const error = new Error('Student not found');
    error.status = 404;
    throw error;
  }

  res.status(200).json({
    message: 'Student deleted successfully',
  });
});
router.get('/students/:id', verfiyAccessToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid student ID format');
    error.status = 400;
    throw error;
  }

  const student = await Student.findById(id);

  if (!student) {
    const error = new Error('Student not found');
    error.status = 404;
    throw error;
  }

  res.status(200).json({ student });
});
router.post(
  '/students/:id/attendance',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid student ID format');
      error.status = 400;
      throw error;
    }

    if (!['حاضر', 'متأخر', 'غائب'].includes(status)) {
      const error = new Error('Invalid attendance status');
      error.status = 400;
      throw error;
    }

    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    student.attendance.push({
      status,
    });

    await student.save();

    res.status(201).json({
      message: 'Attendance added successfully',
    });
  },
);
router.get(
  '/students/:id/attendance',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid student ID format');
      error.status = 400;
      throw error;
    }

    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    const attendance = student.attendance;

    const total = attendance.length;

    const present = attendance.filter((a) => a.status === 'حاضر').length;

    const late = attendance.filter((a) => a.status === 'متأخر').length;

    const absent = attendance.filter((a) => a.status === 'غائب').length;

    res.status(200).json({
      summary: {
        total,
        present,
        late,
        absent,
      },
      attendance,
    });
  },
);
router.post(
  '/students/:id/exams',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { name, studentScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid student ID format');
      error.status = 400;
      throw error;
    }

    if (!name || studentScore === undefined) {
      const error = new Error('Exam name and student score are required');
      error.status = 400;
      throw error;
    }

    if (studentScore < 0 || studentScore > 30) {
      const error = new Error('Student score must be between 0 and 30');
      error.status = 400;
      throw error;
    }

    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    const xpEarned = Math.round((studentScore / 30) * 100);

    student.exams.push({
      name,
      totalScore: 30,
      studentScore,
      xpEarned,
    });

    student.xp += xpEarned;

    await student.save();

    res.status(201).json({
      message: 'Exam added successfully',
      xpEarned,
    });
  },
);
router.get(
  '/students/:id/exams',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid student ID format');
      error.status = 400;
      throw error;
    }

    const student = await Student.findById(id).select('exams');

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      exams: student.exams,
    });
  },
);
router.post(
  '/students/:id/session',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { homeWork, rate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid student ID format');
      error.status = 400;
      throw error;
    }

    if (!['نعم', 'لا'].includes(homeWork)) {
      const error = new Error('Invalid homework status');
      error.status = 400;
      throw error;
    }

    if (!['ممتاز', 'جيد جدا', 'مقبول'].includes(rate)) {
      const error = new Error('Invalid rate');
      error.status = 400;
      throw error;
    }

    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    let xpEarned = 0;

    // Homework XP
    if (homeWork === 'نعم') {
      xpEarned += 5;
    }

    // Rate XP
    switch (rate) {
      case 'ممتاز':
        xpEarned += 5;
        break;

      case 'جيد جدا':
        xpEarned += 4;
        break;

      case 'مقبول':
        xpEarned += 3;
        break;
    }

    student.homeWork.push({
      status: homeWork,
    });

    student.rate.push({
      status: rate,
    });

    student.xp += xpEarned;

    await student.save();

    res.status(201).json({
      message: 'Session saved successfully',
      xpEarned,
      totalXP: student.xp,
    });
  },
);
router.put(
  '/students/:id/payments',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { month, isPaid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid student ID format');
      error.status = 400;
      throw error;
    }

    if (month < 1 || month > 12) {
      const error = new Error('Month must be between 1 and 12');
      error.status = 400;
      throw error;
    }

    if (typeof isPaid !== 'boolean') {
      const error = new Error('isPaid must be true or false');
      error.status = 400;
      throw error;
    }

    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    const payment = student.payments.find((payment) => payment.month === month);

    if (payment) {
      payment.isPaid = isPaid;
      payment.paidAt = Date.now();
    } else {
      student.payments.push({
        month,
        isPaid,
      });
    }

    await student.save();

    res.status(200).json({
      message: 'Payment updated successfully',
      payments: student.payments,
    });
  },
);
export default router;
