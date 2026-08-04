import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios.js';
import OneStudent from '../components/oneStudent.jsx';
import { useNavigate } from 'react-router-dom';
const OWNERS = ['الطالب', 'الأب', 'الأم', 'ولي الأمر'];
const STUDYING_OPTIONS = [
  { value: 'عام', label: 'عام' },
  { value: 'ازهر', label: 'أزهر' },
];
const ATTENDANCE_OPTIONS = ['حاضر', 'متأخر', 'غائب'];
const RATE_OPTIONS = ['ممتاز', 'جيد جدا', 'مقبول'];
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

const students = () => {
  const { gradeId } = useParams();
  const location = useLocation();
  const gradeName = location.state?.gradeName;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // --- Add / Edit student modal ---
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formStudent, setFormStudent] = useState(null);
  const [formName, setFormName] = useState('');
  const [formStudying, setFormStudying] = useState('');
  const [formPhones, setFormPhones] = useState([
    { owner: 'الطالب', number: '' },
  ]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // --- Attendance / Session / Exam modal ---
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionStudent, setActionStudent] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [homeWork, setHomeWork] = useState('');
  const [rate, setRate] = useState('');
  const [examName, setExamName] = useState('');
  const [examScore, setExamScore] = useState('');
  const [paymentMonth, setPaymentMonth] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- Delete confirm ---
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    const getStudents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/grades/${gradeId}/students`);
        setStudents(data.students);
      } catch (err) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الطلاب');
      }
      setLoading(false);
    };
    getStudents();
  }, [gradeId]);

  const sortByXp = (list) => [...list].sort((a, b) => b.xp - a.xp);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedStudents = STUDYING_OPTIONS.map(({ value, label }) => ({
    value,
    label,
    students: filteredStudents.filter((s) => s.studying === value),
  }));
  const otherStudents = filteredStudents.filter(
    (s) => !STUDYING_OPTIONS.some((o) => o.value === s.studying),
  );

  // ---------- Add / Edit form helpers ----------
  const availableOwners = (currentIndex) => {
    const usedElsewhere = formPhones
      .filter((_, i) => i !== currentIndex)
      .map((p) => p.owner);
    return OWNERS.filter((o) => !usedElsewhere.includes(o));
  };

  const updatePhone = (index, field, value) => {
    setFormPhones((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPhoneRow = () => {
    if (formPhones.length < OWNERS.length) {
      const used = formPhones.map((p) => p.owner);
      const nextOwner = OWNERS.find((o) => !used.includes(o)) || '';
      setFormPhones((prev) => [...prev, { owner: nextOwner, number: '' }]);
    }
  };

  const removePhoneRow = (index) => {
    setFormPhones((prev) => prev.filter((_, i) => i !== index));
  };

  const openAddForm = () => {
    setFormMode('add');
    setFormStudent(null);
    setFormName('');
    setFormStudying('');
    setFormPhones([{ owner: 'الطالب', number: '' }]);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (student) => {
    setFormMode('edit');
    setFormStudent(student);
    setFormName(student.name);
    setFormStudying(student.studying || '');
    setFormPhones(
      student.phones?.length
        ? student.phones
        : [{ owner: 'الطالب', number: '' }],
    );
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);
    if (!formStudying) {
      setFormError('اختار الحالة الدراسية');
      setFormSubmitting(false);
      return;
    }
    try {
      const payload = {
        name: formName,
        studying: formStudying,
        phones: formPhones.filter((p) => p.owner && p.number),
      };

      if (formMode === 'add') {
        const { data } = await api.post(`/grades/${gradeId}/students`, payload);
        setStudents((prev) => sortByXp([...prev, data.Student]));
      } else {
        const { data } = await api.put(
          `/students/Update/${formStudent._id}`,
          payload,
        );
        setStudents((prev) =>
          sortByXp(
            prev.map((s) => (s._id === data.Student._id ? data.Student : s)),
          ),
        );
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'حدث خطأ، حاول تاني');
    }
    setFormSubmitting(false);
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    if (!deleteStudent) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/students/${deleteStudent._id}`);
      setStudents((prev) => prev.filter((s) => s._id !== deleteStudent._id));
      setDeleteStudent(null);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر حذف الطالب');
    }
    setDeleteSubmitting(false);
  };

  // ---------- Attendance / Session / Exam ----------
  const openAction = (student, type) => {
    setActionStudent(student);
    setActionType(type);
    setAttendanceStatus('');
    setHomeWork('');
    setRate('');
    setExamName('');
    setExamScore('');
    setPaymentMonth('');
    setActionError('');
    setActionOpen(true);
  };

  const closeAction = () => setActionOpen(false);

  const handleActionConfirm = async (e) => {
    e.preventDefault();
    setActionError('');

    if (actionType === 'attendance' && !attendanceStatus) {
      setActionError('اختار الحالة الأول');
      return;
    }
    if (actionType === 'session' && (!homeWork || !rate)) {
      setActionError('اختار كل الحقول');
      return;
    }
    if (actionType === 'exam') {
      const score = Number(examScore);
      if (!examName.trim() || examScore === '' || score < 0 || score > 30) {
        setActionError('اكتب اسم الامتحان ودرجة من 0 إلى 30');
        return;
      }
    }
    if (actionType === 'payment' && !paymentMonth) {
      setActionError('اختار الشهر الأول');
      return;
    }

    setActionSubmitting(true);
    try {
      if (actionType === 'attendance') {
        await api.post(`/students/${actionStudent._id}/attendance`, {
          status: attendanceStatus,
        });
      } else if (actionType === 'session') {
        const { data } = await api.post(
          `/students/${actionStudent._id}/session`,
          {
            homeWork,
            rate,
          },
        );
        setStudents((prev) =>
          sortByXp(
            prev.map((s) =>
              s._id === actionStudent._id ? { ...s, xp: data.totalXP } : s,
            ),
          ),
        );
      } else if (actionType === 'exam') {
        const { data } = await api.post(
          `/students/${actionStudent._id}/exams`,
          {
            name: examName,
            studentScore: Number(examScore),
          },
        );
        setStudents((prev) =>
          sortByXp(
            prev.map((s) =>
              s._id === actionStudent._id
                ? { ...s, xp: s.xp + data.xpEarned }
                : s,
            ),
          ),
        );
      } else if (actionType === 'payment') {
        await api.put(`/students/${actionStudent._id}/payments`, {
          month: Number(paymentMonth),
          isPaid: true,
        });
      }
      setActionOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || 'حدث خطأ، حاول تاني');
    }
    setActionSubmitting(false);
  };

  const actionTitle = {
    attendance: 'بداية حصة',
    session: 'إنهاء حصة',
    exam: 'إضافة امتحان',
    payment: 'دفع مصاريف الشهر',
  }[actionType];

  return (
    <div dir="ltr" className="relative min-h-screen overflow-hidden">
      <img
        src="/backGround.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      <div
        dir="rtl"
        className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-28 md:px-10"
      >
        {/* Header */}
        <Link
          to="/grades"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink/60 transition hover:text-amber-700"
        >
          <span>→</span> رجوع للصفوف
        </Link>

        <div className="mb-8 flex flex-col gap-1">
          <Link to="/">
            <span className="font-display text-sm font-bold text-amber-700">
              الإيمان
            </span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
            {gradeName ? `طلاب ${gradeName}` : 'الطلاب'}
          </h1>
        </div>

        {/* Controls: search + add button */}
        <div className="mb-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطالب..."
              className="w-full rounded-2xl border border-white/70 bg-white/60 py-3 pl-4 pr-11
                         text-ink placeholder:text-ink/30 outline-none transition
                         focus:border-amber-600/60 focus:bg-white/80 focus:ring-2 focus:ring-amber-600/20"
            />
            <svg
              className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3
                       text-sm font-semibold text-white shadow-lg shadow-ink/15 transition
                       hover:bg-amber-700 hover:shadow-amber-700/25 sm:w-auto"
          >
            <span className="text-lg leading-none">+</span>
            إضافة طالب
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-amber-700" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-center font-medium text-red-700">
            {error}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/60 bg-white/30 py-24 text-center backdrop-blur-sm">
            <span className="text-4xl">🧑‍🎓</span>
            <p className="text-xl font-bold text-ink/70">
              {students.length === 0
                ? 'لا يوجد طلاب بعد'
                : 'مفيش نتائج تطابق بحثك'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {groupedStudents.map(
              (group) =>
                group.students.length > 0 && (
                  <div key={group.value} className="flex flex-col gap-4">
                    <div>
                      <h2 className="font-display text-3xl font-extrabold text-ink">
                        {group.label}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-ink/50">
                        طلاب {group.label}
                      </p>
                    </div>

                    {group.students.map((student) => (
                      <OneStudent
                        key={student._id}
                        student={student}
                        rank={students.findIndex((s) => s._id === student._id)}
                        onEdit={openEditForm}
                        onDelete={setDeleteStudent}
                        onAction={openAction}
                      />
                    ))}
                  </div>
                ),
            )}

            {otherStudents.length > 0 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-3xl font-extrabold text-ink">
                    غير محدد
                  </h2>
                  <p className="mt-1 text-sm font-medium text-ink/50">
                    طلاب من غير حالة دراسية محددة
                  </p>
                </div>

                {otherStudents.map((student) => (
                  <OneStudent
                    key={student._id}
                    student={student}
                    rank={students.findIndex((s) => s._id === student._id)}
                    onEdit={openEditForm}
                    onDelete={setDeleteStudent}
                    onAction={openAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------- Add / Edit student modal ---------------- */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/75
                       p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <button
              onClick={closeForm}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center
                         rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink">
              {formMode === 'add' ? 'إضافة طالب' : 'تعديل بيانات الطالب'}
            </h2>

            <form
              onSubmit={handleFormSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  اسم الطالب
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="اسم الطالب بالكامل"
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink placeholder:text-ink/30 outline-none transition
                             focus:border-amber-600/60 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  الحالة الدراسية
                </label>
                <select
                  value={formStudying}
                  onChange={(e) => setFormStudying(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                >
                  <option value="">اختار الحالة الدراسية</option>
                  {STUDYING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink/80">
                    أرقام الهاتف
                  </label>
                  {formPhones.length < OWNERS.length && (
                    <button
                      type="button"
                      onClick={addPhoneRow}
                      className="text-sm font-semibold text-amber-700 transition hover:text-ink"
                    >
                      + إضافة رقم
                    </button>
                  )}
                </div>

                {formPhones.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={p.owner}
                      onChange={(e) => updatePhone(i, 'owner', e.target.value)}
                      className="w-2/5 rounded-2xl border border-white/70 bg-white/70 px-3 py-3
                                 text-ink outline-none transition focus:border-amber-600/60
                                 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    >
                      {availableOwners(i).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={p.number}
                      onChange={(e) => updatePhone(i, 'number', e.target.value)}
                      placeholder="01xxxxxxxxx"
                      maxLength={11}
                      dir="ltr"
                      className="w-3/5 rounded-2xl border border-white/70 bg-white/70 px-3 py-3
                                 text-center text-ink placeholder:text-ink/30 outline-none transition
                                 focus:border-amber-600/60 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    />

                    {formPhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhoneRow(i)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                                   text-ink/40 transition hover:bg-red-50 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={formSubmitting}
                className="mt-2 w-full rounded-2xl bg-ink py-3.5 text-base font-semibold text-white
                           shadow-lg shadow-ink/15 transition hover:bg-amber-700 hover:shadow-amber-700/25
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formSubmitting
                  ? 'جارِ الحفظ...'
                  : formMode === 'add'
                    ? 'إضافة الطالب'
                    : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Attendance / Session / Exam modal ---------------- */}
      {actionOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={closeAction}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/75
                       p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <button
              onClick={closeAction}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center
                         rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink">
              {actionTitle}
            </h2>
            <p className="mt-1 text-sm text-ink/60">{actionStudent?.name}</p>

            <form
              onSubmit={handleActionConfirm}
              className="mt-6 flex flex-col gap-5"
            >
              {actionType === 'attendance' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink/80">
                    حالة الحضور
                  </label>
                  <select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value)}
                    className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                               text-ink outline-none transition focus:border-amber-600/60
                               focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                  >
                    <option value="">اختار الحالة</option>
                    {ATTENDANCE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'session' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-ink/80">
                      حل الواجب؟
                    </label>
                    <select
                      value={homeWork}
                      onChange={(e) => setHomeWork(e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                                 text-ink outline-none transition focus:border-amber-600/60
                                 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    >
                      <option value="">اختار</option>
                      <option value="نعم">نعم</option>
                      <option value="لا">لا</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-ink/80">
                      تقييم الأداء
                    </label>
                    <select
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                                 text-ink outline-none transition focus:border-amber-600/60
                                 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    >
                      <option value="">اختار</option>
                      {RATE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {actionType === 'exam' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-ink/80">
                      اسم الامتحان
                    </label>
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="مثال: امتحان الشهر"
                      className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                                 text-ink placeholder:text-ink/30 outline-none transition
                                 focus:border-amber-600/60 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-ink/80">
                      الدرجة (من 30)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={examScore}
                      onChange={(e) => setExamScore(e.target.value)}
                      placeholder="0 - 30"
                      className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                                 text-ink placeholder:text-ink/30 outline-none transition
                                 focus:border-amber-600/60 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    />
                  </div>
                </>
              )}

              {actionType === 'payment' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink/80">
                    الشهر المدفوع
                  </label>
                  <select
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                               text-ink outline-none transition focus:border-amber-600/60
                               focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                  >
                    <option value="">اختار الشهر</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
                  {actionError}
                </div>
              )}

              <button
                type="submit"
                disabled={actionSubmitting}
                className="mt-2 w-full rounded-2xl bg-ink py-3.5 text-base font-semibold text-white
                           shadow-lg shadow-ink/15 transition hover:bg-amber-700 hover:shadow-amber-700/25
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionSubmitting ? 'جارِ الحفظ...' : 'تأكيد'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Delete confirm modal ---------------- */}
      {deleteStudent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setDeleteStudent(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/75
                       p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <span className="text-4xl">⚠️</span>
            <h2 className="font-display mt-3 text-xl font-extrabold text-ink">
              متأكد إنك عايز تحذف {deleteStudent.name}؟
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              الإجراء ده مش هينفع يتراجع فيه بعدين
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteStudent(null)}
                className="flex-1 rounded-2xl border-2 border-ink/15 py-4 text-base font-bold
                           text-ink transition hover:bg-ink/5"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="flex-1 rounded-2xl bg-red-600 py-4 text-base font-bold text-white
                           shadow-lg shadow-red-600/20 transition hover:bg-red-700
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteSubmitting ? 'جارِ الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default students;
