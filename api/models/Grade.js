import mongoose from 'mongoose';

const gradeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  session: [
    {
      day: String,
      time: String,
    },
  ],
});
const Grade = mongoose.model('Grades', gradeSchema);
export default Grade;
