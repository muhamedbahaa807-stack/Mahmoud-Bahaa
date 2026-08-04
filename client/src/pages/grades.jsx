import OneGrade from '../components/oneGrade';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/axios.js';
import { Link } from 'react-router-dom';

const DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
];

const grades = () => {
  const [grades, setgrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // --- Add / Edit grade modal state ---
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [editingGrade, setEditingGrade] = useState(null);
  const [name, setName] = useState('');
  const [sessions, setSessions] = useState([{ day: '', time: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // --- Delete grade confirm ---
  const [deleteGrade, setDeleteGrade] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [studentCounts, setStudentCounts] = useState({});

  useEffect(() => {
    const getGrades = async () => {
      setLoading(true);
      try {
        const [{ data: gradesData }, { data: studentsData }] =
          await Promise.all([api.get('/grades'), api.get('/students')]);
        setgrades(gradesData.grades);

        const counts = {};
        (studentsData.students || []).forEach((s) => {
          counts[s.gradeId] = (counts[s.gradeId] || 0) + 1;
        });
        setStudentCounts(counts);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load Grades');
      }
      setLoading(false);
    };
    getGrades();
  }, []);

  const filteredGrades = grades.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const updateSession = (index, field, value) => {
    setSessions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const addSessionRow = () => {
    if (sessions.length < 2) {
      setSessions((prev) => [...prev, { day: '', time: '' }]);
    }
  };

  const removeSessionRow = (index) => {
    setSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setSessions([{ day: '', time: '' }]);
    setModalError('');
  };

  const openAddModal = () => {
    setFormMode('add');
    setEditingGrade(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (grade) => {
    setFormMode('edit');
    setEditingGrade(grade);
    setName(grade.name);
    setSessions(
      grade.session?.length ? grade.session : [{ day: '', time: '' }],
    );
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      const validSessions = sessions.filter((s) => s.day && s.time);

      if (formMode === 'add') {
        const { data } = await api.post('/grade', {
          name,
          session: validSessions,
        });
        setgrades((prev) => [...prev, data.newGrade]);
      } else {
        const { data } = await api.put(`/updateGrade/${editingGrade._id}`, {
          name,
          session: validSessions,
        });
        setgrades((prev) =>
          prev.map((g) => (g._id === editingGrade._id ? data.grade : g)),
        );
      }
      closeModal();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
          (formMode === 'add'
            ? 'حدث خطأ أثناء إضافة الصف'
            : 'حدث خطأ أثناء تعديل الصف'),
      );
    }
    setSubmitting(false);
  };

  const handleDeleteGrade = async () => {
    if (!deleteGrade) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/grade/${deleteGrade._id}`);
      setgrades((prev) => prev.filter((g) => g._id !== deleteGrade._id));
      setDeleteGrade(null);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر حذف الصف');
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
        className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-28 md:px-10"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <Link to="/">
            <span className="font-display text-sm font-bold text-amber-700">
              الإيمان
            </span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
            الصفوف الدراسية
          </h1>
        </div>

        {/* Controls: search + add button */}
        <div className="mb-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الصف..."
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
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3
                       text-sm font-semibold text-white shadow-lg shadow-ink/15 transition
                       hover:bg-amber-700 hover:shadow-amber-700/25 sm:w-auto"
          >
            <span className="text-lg leading-none">+</span>
            إضافة صف جديد
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
        ) : filteredGrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/60 bg-white/30 py-24 text-center backdrop-blur-sm">
            <span className="text-4xl">📚</span>
            <p className="text-xl font-bold text-ink/70">
              {grades.length === 0
                ? 'لا يوجد صفوف بعد'
                : 'مفيش نتائج تطابق بحثك'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGrades.map((grade) => (
              <OneGrade
                key={grade._id}
                grade={grade}
                studentsCount={studentCounts[grade._id] || 0}
                onEdit={openEditModal}
                onDelete={setDeleteGrade}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Grade Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          style={{ animation: 'backdrop-in 0.2s ease-out' }}
          onClick={closeModal}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/75
                       p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <button
              onClick={closeModal}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center
                         rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink">
              {formMode === 'add' ? 'إضافة صف جديد' : 'تعديل الصف'}
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              اكتب اسم الصف ومواعيد الحصص
            </p>

            <form
              onSubmit={handleAddGrade}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  اسم الصف
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الصف الأول الثانوي"
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink placeholder:text-ink/30 outline-none transition
                             focus:border-amber-600/60 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink/80">
                    مواعيد الحصص
                  </label>
                  {sessions.length < 2 && (
                    <button
                      type="button"
                      onClick={addSessionRow}
                      className="text-sm font-semibold text-amber-700 transition hover:text-ink"
                    >
                      + إضافة معاد تاني
                    </button>
                  )}
                </div>

                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={s.day}
                      onChange={(e) => updateSession(i, 'day', e.target.value)}
                      className="w-1/2 rounded-2xl border border-white/70 bg-white/70 px-3 py-3
                                 text-ink outline-none transition focus:border-amber-600/60
                                 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    >
                      <option value="">اليوم</option>
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={s.time}
                      onChange={(e) => updateSession(i, 'time', e.target.value)}
                      className="w-1/2 rounded-2xl border border-white/70 bg-white/70 px-3 py-3
                                 text-ink outline-none transition focus:border-amber-600/60
                                 focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                    />

                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSessionRow(i)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                                   text-ink/40 transition hover:bg-red-50 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {modalError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
                  {modalError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-2xl bg-ink py-3.5 text-base font-semibold text-white
                           shadow-lg shadow-ink/15 transition hover:bg-amber-700 hover:shadow-amber-700/25
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'جارِ الحفظ...'
                  : formMode === 'add'
                    ? 'إضافة الصف'
                    : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Grade Confirm */}
      {deleteGrade && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setDeleteGrade(null)}
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
              متأكد إنك عايز تحذف {deleteGrade.name}؟
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              هيتم حذف كل الطلاب المسجلين في الصف ده كمان، ومينفعش يترجع بعد كده
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteGrade(null)}
                className="flex-1 rounded-2xl border-2 border-ink/15 py-4 text-base font-bold
                           text-ink transition hover:bg-ink/5"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteGrade}
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

export default grades;
