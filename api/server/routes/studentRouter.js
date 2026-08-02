import { Router } from 'express';
import { isAdmin, verfiyAccessToken } from '../utils/middlewares.js';
import { checkSchema, validationResult } from 'express-validator';
import Student from '../../models/Student.js';
import Grade from '../../models/Grade.js';
import { studentSchema } from '../utils/validation.js';
const router = Router();
router.get(
  '/grades/:id/students',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid Grade ID format',
      });
    }

    try {
      const grade = await Grade.findById(id);

      if (!grade) {
        return res.status(404).json({
          message: 'Grade not found',
        });
      }

      const students = await Student.find({ gradeId: id }).sort({ xp: -1 });

      return res.status(200).json({ students });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  },
);
router.post(
  '/grades/:id/students',
  verfiyAccessToken,
  isAdmin,
  checkSchema(studentSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({ error: result.array() });
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid Grade ID format',
      });
    }
    const { name, phones } = req.body;
    try {
      const grade = await Grade.findById(id);

      if (!grade) {
        return res.status(404).json({
          message: 'Grade not found',
        });
      }
      const isExist = await Student.findOne({
        'phones.number': {
          $in: phones.map((phone) => phone.number),
        },
      });
      if (isExist) {
        return res.status(409).json({ message: 'Phone number already exists' });
      }
      const newStudent = await Student.create({ name, phones, gradeId: id });
      res.status(201).json({ message: 'Student created', Student: newStudent });
    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
);
router.put(
  '/students/Update/:id',
  verfiyAccessToken,
  isAdmin,
  checkSchema(studentSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).json({ error: result.array() });
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }
    const { name, phones } = req.body;
    try {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }
      const isExist = await Student.findOne({
        _id: { $ne: id },
        'phones.number': {
          $in: phones.map((phone) => phone.number),
        },
      });
      if (isExist) {
        return res.status(409).json({ message: 'Phone number already exists' });
      }
      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { name, phones },
        { new: true, runValidators: true },
      );
      res
        .status(200)
        .json({ message: 'Student updated', Student: updatedStudent });
    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
);
router.delete('/students/:id', verfiyAccessToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid Student ID format',
    });
  }
  try {
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      message: 'Student deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/students/:id', verfiyAccessToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid Student ID format',
    });
  }
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }
    res.status(200).json({ student });
  } catch {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post(
  '/students/:id/attendance',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }

    if (!['حاضر', 'متأخر', 'غائب'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid attendance status',
      });
    }

    try {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }

      student.attendance.push({
        status,
      });

      await student.save();

      return res.status(201).json({
        message: 'Attendance added successfully',
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  },
);
router.get(
  '/students/:id/attendance',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }

    try {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }

      const attendance = student.attendance;

      const total = attendance.length;

      const present = attendance.filter((a) => a.status === 'حاضر').length;

      const late = attendance.filter((a) => a.status === 'متأخر').length;

      const absent = attendance.filter((a) => a.status === 'غائب').length;

      return res.status(200).json({
        summary: {
          total,
          present,
          late,
          absent,
        },
        attendance,
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
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
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }

    if (!name || studentScore === undefined) {
      return res.status(400).json({
        message: 'Exam name and student score are required',
      });
    }

    if (studentScore < 0 || studentScore > 30) {
      return res.status(400).json({
        message: 'Student score must be between 0 and 30',
      });
    }

    try {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
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

      return res.status(201).json({
        message: 'Exam added successfully',
        xpEarned,
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  },
);
router.get(
  '/students/:id/exams',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }

    try {
      const student = await Student.findById(id).select('exams');

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }

      return res.status(200).json({
        exams: student.exams,
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
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
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }

    if (!['نعم', 'لا'].includes(homeWork)) {
      return res.status(400).json({
        message: 'Invalid homework status',
      });
    }

    if (!['ممتاز', 'جيد جدا', 'مقبول'].includes(rate)) {
      return res.status(400).json({
        message: 'Invalid rate',
      });
    }

    try {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
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

      return res.status(201).json({
        message: 'Session saved successfully',
        xpEarned,
        totalXP: student.xp,
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
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
      return res.status(400).json({
        message: 'Invalid Student ID format',
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        message: 'Month must be between 1 and 12',
      });
    }

    if (typeof isPaid !== 'boolean') {
      return res.status(400).json({
        message: 'isPaid must be true or false',
      });
    }

    try {
      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          message: 'Student not found',
        });
      }

      const payment = student.payments.find(
        (payment) => payment.month === month,
      );

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

      return res.status(200).json({
        message: 'Payment updated successfully',
        payments: student.payments,
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }
  },
);
export default router;
