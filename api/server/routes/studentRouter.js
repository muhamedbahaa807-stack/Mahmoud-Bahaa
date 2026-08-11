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
  '/grades/:id/bulk-attendance',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { attendances } = req.body; // Array of { studentId, status }

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

    // --- تحقق 1: الالتزام بمواعيد الصف الأسبوعية ---
    if (grade.days && grade.days.length > 0) {
      const daysMap = [
        'الأحد',
        'الإثنين',
        'الثلاثاء',
        'الأربعاء',
        'الخميس',
        'الجمعة',
        'السبت',
      ];
      const todayName = daysMap[new Date().getDay()];

      if (!grade.days.includes(todayName)) {
        const error = new Error(
          `اليوم ليس من مواعيد هذا الصف (${grade.days.join(' - ')})`,
        );
        error.status = 400;
        throw error;
      }
    }

    // --- تحقق 2: منع التكرار في نفس اليوم ---
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const checkStudent = await Student.findOne({
      gradeId: id,
      'attendance.date': { $gte: startOfToday, $lte: endOfToday },
    });

    if (checkStudent) {
      const error = new Error('تم تسجيل بداية حصة لهذا الصف بالفعل اليوم!');
      error.status = 400;
      throw error;
    }

    // --- إدخال الحضور دفعة واحدة ---
    const bulkOps = attendances.map((item) => ({
      updateOne: {
        filter: { _id: item.studentId },
        update: {
          $push: { attendance: { status: item.status, date: new Date() } },
        },
      },
    }));

    await Student.bulkWrite(bulkOps);

    const updatedStudents = await Student.find({ gradeId: id }).sort({
      xp: -1,
    });
    res.status(200).json({
      message: 'تم تسجيل بداية الحصة بنجاح',
      students: updatedStudents,
    });
  },
);

// ==========================================
// 2. تسجيل الواجب الجماعي (Bulk Homework)
// ==========================================
router.post(
  '/grades/:id/bulk-homework',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { homeworks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid Grade ID format');
      error.status = 400;
      throw error;
    }

    const students = await Student.find({ gradeId: id });
    for (const item of homeworks) {
      const student = students.find((s) => s._id.toString() === item.studentId);
      if (student) {
        let xpEarned = 0;
        if (item.status === 'ممتاز') xpEarned = 5;
        else if (item.status === 'جيد') xpEarned = 4;
        else if (item.status === 'مقبول') xpEarned = 2;
        else if (item.status === 'لم يحضر') xpEarned = 0;
        student.homeWork.push({ status: item.status });
        student.xp += xpEarned;
        await student.save();
      }
    }

    const updatedStudents = await Student.find({ gradeId: id }).sort({
      xp: -1,
    });
    res
      .status(200)
      .json({ message: 'تم تسجيل الواجب بنجاح', students: updatedStudents });
  },
);

// ==========================================
// 3. تسجيل التقييم الجماعي (Bulk Rate)
router.post(
  '/grades/:id/bulk-rate',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { rates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid Grade ID format');
      error.status = 400;
      throw error;
    }

    const students = await Student.find({ gradeId: id });
    for (const item of rates) {
      const student = students.find((s) => s._id.toString() === item.studentId);
      if (student) {
        let xpEarned = 0;
        if (item.rate === 'ممتاز') xpEarned = 5;
        else if (item.rate === 'جيد') xpEarned = 4;
        else if (item.rate === 'مقبول') xpEarned = 2;
        else if (item.rate === 'لم يحضر') xpEarned = 0;

        student.rate.push({ status: item.rate });
        student.xp += xpEarned;
        await student.save();
      }
    }

    const updatedStudents = await Student.find({ gradeId: id }).sort({
      xp: -1,
    });
    res
      .status(200)
      .json({ message: 'تم تسجيل التقييم بنجاح', students: updatedStudents });
  },
);

// ==========================================
// 4. تسجيل الامتحان الجماعي (Bulk Exam)
router.post(
  '/grades/:id/bulk-exams',
  verfiyAccessToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { name, scores } = req.body;

    if (!name) {
      const error = new Error('اسم الامتحان مطلوب');
      error.status = 400;
      throw error;
    }

    const students = await Student.find({ gradeId: id });
    for (const item of scores) {
      const student = students.find((s) => s._id.toString() === item.studentId);
      if (
        student &&
        item.studentScore !== undefined &&
        item.studentScore !== ''
      ) {
        const score = Number(item.studentScore);
        const xpEarned = Math.round((score / 30) * 100);

        student.exams.push({
          name,
          totalScore: 30,
          studentScore: score,
          xpEarned,
        });
        student.xp += xpEarned;
        await student.save();
      }
    }

    const updatedStudents = await Student.find({ gradeId: id }).sort({
      xp: -1,
    });
    res.status(200).json({
      message: 'تم إدخال درجات الامتحان بنجاح',
      students: updatedStudents,
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
