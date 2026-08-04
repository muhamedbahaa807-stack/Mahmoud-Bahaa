import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

const MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const studentDetails = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const getStudent = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/students/${studentId}`);
        setStudent(data.student);
      } catch (err) {
        setError(
          err.response?.data?.message || 'حدث خطأ أثناء تحميل بيانات الطالب',
        );
      }
      setLoading(false);
    };
    getStudent();
  }, [studentId]);

  const attendance = student?.attendance || [];
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'حاضر').length;
  const late = attendance.filter((a) => a.status === 'متأخر').length;
  const absent = attendance.filter((a) => a.status === 'غائب').length;

  const paidMonths = new Set(
    (student?.payments || []).filter((p) => p.isPaid).map((p) => p.month),
  );

  return (
    <div dir="ltr" className="relative min-h-screen overflow-hidden">
      <img
        src="/backGround.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      <div
        dir="rtl"
        className="relative z-10 mx-auto max-w-3xl px-6 pb-16 pt-28 md:px-10"
      >
        {student && (
          <Link
            to={`/grades/${student.gradeId}/students`}
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink/60 transition hover:text-amber-700"
          >
            <span>→</span> رجوع لطلاب الصف
          </Link>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-amber-700" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-center font-medium text-red-700">
            {error}
          </div>
        ) : student ? (
          <div className="flex flex-col gap-6">
            {/* Header card */}
            <div className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-lg shadow-black/5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-display text-sm font-bold text-amber-700">
                    الإيمان
                  </span>
                  <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">
                    {student.name}
                  </h1>
                  {student.studying && (
                    <span className="mt-2 inline-block rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-ink/70">
                      {student.studying === 'ازهر' ? 'أزهر' : student.studying}
                    </span>
                  )}
                </div>
                <div className="rounded-2xl bg-ink px-5 py-3 text-center text-white">
                  <p className="text-2xl font-extrabold">{student.xp}</p>
                  <p className="text-xs font-medium text-white/70">XP</p>
                </div>
              </div>

              {student.phones?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {student.phones.map((p, i) => (
                    <span
                      key={i}
                      dir="ltr"
                      className="rounded-full bg-ink/5 px-4 py-1.5 text-sm font-medium text-ink/70"
                    >
                      {p.owner}: {p.number}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance */}
            <div className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-lg shadow-black/5 backdrop-blur-xl">
              <h2 className="font-display text-xl font-bold text-ink">
                الحضور
              </h2>
              <p className="mt-2 text-ink/70">
                حضر <span className="font-bold text-ink">{present + late}</span>{' '}
                من <span className="font-bold text-ink">{total}</span> حصة، منهم{' '}
                <span className="font-bold text-amber-700">{late}</span> متأخر
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
                  حاضر: {present}
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
                  متأخر: {late}
                </span>
                <span className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600">
                  غائب: {absent}
                </span>
              </div>
            </div>

            {/* Exams */}
            <div className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-lg shadow-black/5 backdrop-blur-xl">
              <h2 className="font-display text-xl font-bold text-ink">
                الامتحانات
              </h2>

              {student.exams?.length ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/60">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-white/50 text-sm text-ink/60">
                        <th className="px-4 py-3 font-medium">اسم الامتحان</th>
                        <th className="px-4 py-3 font-medium">النتيجة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.exams.map((exam, i) => (
                        <tr key={i} className="border-t border-white/50">
                          <td className="px-4 py-3 font-semibold text-ink">
                            {exam.name}
                          </td>
                          <td className="px-4 py-3 font-semibold text-ink">
                            {exam.studentScore} / {exam.totalScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-ink/50">لسه مفيش امتحانات مسجّلة</p>
              )}
            </div>

            {/* Payments */}
            <div className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-lg shadow-black/5 backdrop-blur-xl">
              <h2 className="font-display text-xl font-bold text-ink">
                مصاريف الشهور
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {MONTHS.map((m, i) => {
                  const paid = paidMonths.has(i + 1);
                  return (
                    <div
                      key={m}
                      className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center
                                  ${
                                    paid
                                      ? 'border-green-200 bg-green-50'
                                      : 'border-red-200 bg-red-50'
                                  }`}
                    >
                      <span className="text-lg">{paid ? '✅' : '❌'}</span>
                      <span
                        className={`text-xs font-semibold ${
                          paid ? 'text-green-700' : 'text-red-600'
                        }`}
                      >
                        {m}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default studentDetails;
