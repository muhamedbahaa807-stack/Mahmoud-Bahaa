import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios.js';
import OneStudent from '../components/oneStudent.jsx';

const OWNERS = ['الطالب', 'الأب', 'الأم', 'ولي الأمر'];
const STUDYING_OPTIONS = [
  { value: 'عام', label: 'عام' },
  { value: 'ازهر', label: 'أزهر' },
];
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
const ATTENDANCE_OPTIONS = ['حاضر', 'متأخر', 'غائب'];
const RATE_OPTIONS = ['جيد', 'مقبول', 'ممتاز'];

const Students = () => {
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

  // --- Bulk Action Modals (بداية حصة - تقييم - واجب - امتحان) ---
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkType, setBulkType] = useState(''); // 'attendance' | 'homework' | 'rate' | 'exam'
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // Data State for Bulk Modals
  const [bulkAttendance, setBulkAttendance] = useState({});
  const [bulkHomework, setBulkHomework] = useState({});
  const [bulkRate, setBulkRate] = useState({});
  const [bulkExamName, setBulkExamName] = useState('');
  const [bulkExamScores, setBulkExamScores] = useState({});

  // --- Delete confirm ---
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [paymentStudent, setPaymentStudent] = useState(null);
  const [paymentMonth, setPaymentMonth] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/grades/${gradeId}/students`);
      setStudents(data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل الطلاب');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [gradeId]);

  const sortByXp = (list) => [...list].sort((a, b) => b.xp - a.xp);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ---------- فتح الـ Bulk Action Modal بتهيئة قيم أولية ----------
  const openBulkModal = (type) => {
    setBulkType(type);
    setBulkError('');

    const initialMap = {};
    students.forEach((s) => {
      if (type === 'attendance') initialMap[s._id] = 'حاضر';
      if (type === 'homework') initialMap[s._id] = 'جيد';
      if (type === 'rate') initialMap[s._id] = 'جيد';
      if (type === 'exam') initialMap[s._id] = '';
    });

    if (type === 'attendance') setBulkAttendance(initialMap);
    if (type === 'homework') setBulkHomework(initialMap);
    if (type === 'rate') setBulkRate(initialMap);
    if (type === 'exam') {
      setBulkExamName('');
      setBulkExamScores(initialMap);
    }

    setBulkActionOpen(true);
  };
  const openPaymentForm = (student) => {
    setPaymentStudent(student);
    setPaymentMonth('');
    setPaymentError('');
  };
  // ---------- حفظ بيانات الـ Bulk Modals ----------
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSubmitting(true);

    try {
      if (bulkType === 'attendance') {
        const payload = Object.keys(bulkAttendance).map((sId) => ({
          studentId: sId,
          status: bulkAttendance[sId],
        }));
        const { data } = await api.post(`/grades/${gradeId}/bulk-attendance`, {
          attendances: payload,
        });
        setStudents(data.students);
      } else if (bulkType === 'homework') {
        const payload = Object.keys(bulkHomework).map((sId) => ({
          studentId: sId,
          status: bulkHomework[sId],
        }));
        const { data } = await api.post(`/grades/${gradeId}/bulk-homework`, {
          homeworks: payload,
        });
        setStudents(data.students);
      } else if (bulkType === 'rate') {
        const payload = Object.keys(bulkRate).map((sId) => ({
          studentId: sId,
          rate: bulkRate[sId],
        }));
        const { data } = await api.post(`/grades/${gradeId}/bulk-rate`, {
          rates: payload,
        });
        setStudents(data.students);
      } else if (bulkType === 'exam') {
        if (!bulkExamName.trim()) {
          setBulkError('يرجى كتابة اسم الامتحان');
          setBulkSubmitting(false);
          return;
        }
        const payload = Object.keys(bulkExamScores).map((sId) => ({
          studentId: sId,
          studentScore: bulkExamScores[sId],
        }));
        const { data } = await api.post(`/grades/${gradeId}/bulk-exams`, {
          name: bulkExamName,
          scores: payload,
        });
        setStudents(data.students);
      }

      setBulkActionOpen(false);
    } catch (err) {
      setBulkError(err.response?.data?.message || 'حدث خطأ، حاول مجدداً');
    }
    setBulkSubmitting(false);
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMonth) {
      setPaymentError('اختار الشهر');
      return;
    }

    setPaymentSubmitting(true);
    setPaymentError('');

    try {
      const { data } = await api.put(
        `/students/${paymentStudent._id}/payments`,
        {
          month: Number(paymentMonth),
          isPaid: true,
        },
      );

      setStudents((prev) =>
        prev.map((student) =>
          student._id === paymentStudent._id
            ? { ...student, payments: data.payments }
            : student,
        ),
      );

      setPaymentStudent(null);
    } catch (err) {
      setPaymentError(
        err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدفع',
      );
    } finally {
      setPaymentSubmitting(false);
    }
  };
  // ---------- Add / Edit form logic ----------
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

  return (
    <div dir="ltr" className="relative min-h-screen overflow-hidden">
      <img
        src="/backGround.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      <div
        dir="rtl"
        className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-28 md:px-10"
      >
        <Link
          to="/grades"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink/60 transition hover:text-amber-700"
        >
          <span>→</span> رجوع للصفوف
        </Link>

        <div className="mb-6 flex flex-col gap-1">
          <Link to="/">
            <span className="font-display text-sm font-bold text-amber-700">
              الإيمان
            </span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
            {gradeName ? `طلاب ${gradeName}` : 'الطلاب'}
          </h1>
        </div>

        {/* --- Bulk Action Buttons Bar --- */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => openBulkModal('attendance')}
            className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
          >
            🟢 بداية حصة (حضور)
          </button>
          <button
            onClick={() => openBulkModal('rate')}
            className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-700"
          >
            ⭐ تسجيل التقييم
          </button>
          <button
            onClick={() => openBulkModal('homework')}
            className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700"
          >
            📚 تسجيل الواجب
          </button>
          <button
            onClick={() => openBulkModal('exam')}
            className="flex-1 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-purple-700"
          >
            ✍️ إضافة امتحان
          </button>
        </div>

        {/* Controls: Search + Add Student Button */}
        <div className="mb-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطالب..."
              className="w-full rounded-2xl border border-white/70 bg-white/60 py-3 pl-4 pr-11 text-ink placeholder:text-ink/30 outline-none transition focus:border-amber-600/60 focus:bg-white/80 focus:ring-2 focus:ring-amber-600/20"
            />
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-ink/15 transition hover:bg-amber-700 hover:shadow-amber-700/25 sm:w-auto"
          >
            <span className="text-lg leading-none">+</span> إضافة طالب
          </button>
        </div>

        {/* Student List */}
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
          <div className="flex flex-col gap-4">
            {filteredStudents.map((student) => (
              <OneStudent
                key={student._id}
                student={student}
                rank={students.findIndex((s) => s._id === student._id)}
                onEdit={openEditForm}
                onDelete={setDeleteStudent}
                onAction={openPaymentForm}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Bulk Action Modal ---------------- */}
      {bulkActionOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setBulkActionOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <button
              onClick={() => setBulkActionOpen(false)}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink mb-2">
              {bulkType === 'attendance' && '🟢 تسجيل الحضور (بداية حصة)'}
              {bulkType === 'rate' && '⭐ تسجيل تقييم الطلاب'}
              {bulkType === 'homework' && '📚 تسجيل الواجب'}
              {bulkType === 'exam' && '✍️ إدخال درجات الامتحان'}
            </h2>

            <form
              onSubmit={handleBulkSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              {bulkType === 'exam' && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-ink/80 block mb-1">
                    اسم الامتحان
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkExamName}
                    onChange={(e) => setBulkExamName(e.target.value)}
                    placeholder="مثال: امتحان الشهر الإجمالي"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-ink outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-2 my-2 divide-y divide-gray-100">
                {students.map((st) => (
                  <div
                    key={st._id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <span className="font-bold text-ink w-1/3 truncate">
                      {st.name}
                    </span>

                    {bulkType === 'attendance' && (
                      <select
                        value={bulkAttendance[st._id] || 'حاضر'}
                        onChange={(e) =>
                          setBulkAttendance({
                            ...bulkAttendance,
                            [st._id]: e.target.value,
                          })
                        }
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                      >
                        {ATTENDANCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {bulkType === 'homework' && (
                      <select
                        value={bulkHomework[st._id] || 'جيد'}
                        onChange={(e) =>
                          setBulkHomework({
                            ...bulkHomework,
                            [st._id]: e.target.value,
                          })
                        }
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                      >
                        <option value="ممتاز">ممتاز</option>
                        <option value="جيد">جيد</option>
                        <option value="مقبول">مقبول</option>
                        <option value="لم يتم">لم يتم</option>
                      </select>
                    )}

                    {bulkType === 'rate' && (
                      <select
                        value={bulkRate[st._id] || 'جيد'}
                        onChange={(e) =>
                          setBulkRate({ ...bulkRate, [st._id]: e.target.value })
                        }
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                      >
                        {RATE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {bulkType === 'exam' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={bulkExamScores[st._id] ?? ''}
                          onChange={(e) =>
                            setBulkExamScores({
                              ...bulkExamScores,
                              [st._id]: e.target.value,
                            })
                          }
                          placeholder="الدرجة من 30"
                          className="w-28 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-center text-sm outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {bulkError && (
                <div className="my-2 rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-700 border border-red-200">
                  {bulkError}
                </div>
              )}

              <button
                type="submit"
                disabled={bulkSubmitting}
                className="mt-4 w-full rounded-2xl bg-ink py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-amber-700 disabled:opacity-60"
              >
                {bulkSubmitting ? 'جارِ الحفظ...' : 'حفظ البيانات للجميع'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Add / Edit Modal ---------------- */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setFormOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/75 p-8 shadow-2xl backdrop-blur-2xl"
          >
            <button
              onClick={() => setFormOpen(false)}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5"
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
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="اسم الطالب بالكامل"
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-ink outline-none"
              />
              <select
                value={formStudying}
                onChange={(e) => setFormStudying(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-ink outline-none"
              >
                <option value="">اختار الحالة الدراسية</option>
                {STUDYING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {formPhones.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={p.owner}
                    onChange={(e) => updatePhone(i, 'owner', e.target.value)}
                    className="w-2/5 rounded-2xl border border-white/70 bg-white/70 px-3 py-3 text-ink outline-none"
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
                    className="w-3/5 rounded-2xl border border-white/70 bg-white/70 px-3 py-3 text-center text-ink outline-none"
                  />
                  {formPhones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoneRow(i)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {formError && (
                <div className="text-sm text-red-600">{formError}</div>
              )}

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full rounded-2xl bg-ink py-3.5 font-semibold text-white transition hover:bg-amber-700"
              >
                {formSubmitting ? 'جارِ الحفظ...' : 'حفظ'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ---------------- Payment Modal ---------------- */}
      {paymentStudent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setPaymentStudent(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/75 p-8 shadow-2xl backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={() => setPaymentStudent(null)}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink">
              💰 دفع الشهر
            </h2>

            <p className="mt-2 text-sm text-ink/60">
              تسجيل دفع شهر للطالب: {paymentStudent.name}
            </p>

            <form
              onSubmit={handlePaymentSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <select
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-ink outline-none"
              >
                <option value="">اختار الشهر</option>

                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>

              {paymentError && (
                <div className="text-sm text-red-600">{paymentError}</div>
              )}

              <button
                type="submit"
                disabled={paymentSubmitting}
                className="w-full rounded-2xl bg-ink py-3.5 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                {paymentSubmitting ? 'جارِ تسجيل الدفع...' : 'تأكيد الدفع'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ---------------- Delete Modal ---------------- */}
      {deleteStudent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setDeleteStudent(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/75 p-8 text-center shadow-2xl backdrop-blur-2xl"
          >
            <span className="text-4xl">⚠️</span>
            <h2 className="font-display mt-3 text-xl font-extrabold text-ink">
              متأكد إنك عايز تحذف {deleteStudent.name}؟
            </h2>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteStudent(null)}
                className="flex-1 rounded-2xl border-2 border-ink/15 py-3 font-bold text-ink"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="flex-1 rounded-2xl bg-red-600 py-3 font-bold text-white shadow-lg"
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

export default Students;
