import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  studying: {
    type: String,
    enum: ['عام', 'ازهر'],
  },
  phones: [
    {
      owner: {
        type: String,
        enum: ['الطالب', 'الأب', 'الأم', 'ولي الأمر'],
        required: true,
      },
      number: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 11,
      },
    },
  ],
  xp: {
    type: Number,
    default: 0,
  },
  gradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  exams: [
    {
      name: {
        type: String,
        required: true,
      },
      totalScore: {
        type: Number,
        required: true,
      },
      studentScore: {
        type: Number,
        required: true,
      },
      xpEarned: {
        type: Number,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  payments: [
    {
      month: {
        type: Number,
        required: true,
      },
      isPaid: {
        type: Boolean,
        required: true,
      },
      paidAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  attendance: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['حاضر', 'متأخر', 'غائب'],
      },
    },
  ],
  homeWork: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['جيد', 'مقبول', 'لم يتم', 'ممتاز'],
      },
    },
  ],
  rate: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['مقبول', 'جيد', 'ممتاز'],
      },
    },
  ],
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
