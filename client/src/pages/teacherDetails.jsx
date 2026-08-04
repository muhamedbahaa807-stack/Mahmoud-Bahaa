import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/axios.js';

const teacherDetails = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [gradesCount, setGradesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Edit profile modal ---
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // --- Change password modal ---
  const [passOpen, setPassOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // --- Logout confirm ---
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const [
          { data: profileData },
          { data: gradesData },
          { data: studentsData },
        ] = await Promise.all([
          api.get('/profile'),
          api.get('/grades'),
          api.get('/students'),
        ]);

        setProfile(profileData);
        setGradesCount(gradesData.grades?.length || 0);
        setStudentsCount(studentsData.students?.length || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
      }
      setLoading(false);
    };
    getData();
  }, []);

  // ---------- Edit profile ----------
  const openEdit = () => {
    setEditName(profile?.name || '');
    setEditEmail(profile?.email || '');
    setEditPhone(profile?.phone || '');
    setEditError('');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      const { data } = await api.put('/updateProfile', {
        name: editName,
        email: editEmail,
        phone: editPhone,
      });
      setProfile(data.user);
      setEditOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'حدث خطأ، حاول تاني');
    }
    setEditSubmitting(false);
  };

  // ---------- Change password ----------
  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassError('');
    setPassSuccess('');
    setPassOpen(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('كلمة السر الجديدة غير متطابقة');
      return;
    }

    setPassSubmitting(true);
    try {
      await api.put('/change-password', { currentPassword, newPassword });
      setPassSuccess('تم تغيير كلمة السر بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'حدث خطأ، حاول تاني');
    }
    setPassSubmitting(false);
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/logOut');
    } catch (err) {
      // ignore network errors here, clear local session anyway
    }
    logout();
    setLoggingOut(false);
    navigate('/signin');
  };

  return (
    <div dir="ltr" className="relative min-h-screen overflow-hidden">
      <img
        src="/backGround.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16">
        {loading ? (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-amber-700" />
        ) : error ? (
          <div
            dir="rtl"
            className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-center font-medium text-red-700"
          >
            {error}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-8 text-center">
            {/* Photo */}
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/50 blur-3xl" />
              <img
                src={profile?.image[0]}
                alt={profile?.name || 'الأستاذ'}
                className="relative h-72 w-auto object-contain drop-shadow-2xl md:h-96"
              />
            </div>

            {/* Name */}
            <div dir="rtl">
              <span className="font-display block text-sm font-bold text-amber-700">
                الإيمان
              </span>
              <h1 className="font-display mt-1 text-3xl font-extrabold text-ink md:text-4xl">
                {profile?.name || 'الأستاذ محمود بهاء'}
              </h1>
              {profile?.email && (
                <p className="mt-2 text-ink/60">{profile.email}</p>
              )}
            </div>

            {/* Stats */}
            <div dir="rtl" className="grid w-full max-w-md grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/60 bg-white/40 p-6 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
                <p className="font-display text-4xl font-extrabold text-ink">
                  {gradesCount}
                </p>
                <p className="mt-1 text-sm font-medium text-ink/60">صف دراسي</p>
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/40 p-6 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
                <p className="font-display text-4xl font-extrabold text-ink">
                  {studentsCount}
                </p>
                <p className="mt-1 text-sm font-medium text-ink/60">طالب</p>
              </div>
            </div>

            {/* Account actions */}
            <div
              dir="rtl"
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <button
                onClick={openEdit}
                className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70
                           px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
              >
                ✏️ تعديل البيانات
              </button>
              <button
                onClick={openPasswordModal}
                className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70
                           px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
              >
                🔒 تغيير كلمة السر
              </button>
              <button
                onClick={() => setLogoutOpen(true)}
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80
                           px-5 py-2.5 text-sm font-semibold text-red-600 transition
                           hover:border-red-600 hover:bg-red-600 hover:text-white"
              >
                🚪 تسجيل خروج
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Edit profile modal ---------------- */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setEditOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/75
                       p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <button
              onClick={() => setEditOpen(false)}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center
                         rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink">
              تعديل البيانات
            </h2>

            <form
              onSubmit={handleEditSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">الاسم</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-right text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  maxLength={11}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-center text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              {editError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
                  {editError}
                </div>
              )}

              <button
                type="submit"
                disabled={editSubmitting}
                className="mt-2 w-full rounded-2xl bg-ink py-3.5 text-base font-semibold text-white
                           shadow-lg shadow-ink/15 transition hover:bg-amber-700 hover:shadow-amber-700/25
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editSubmitting ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Change password modal ---------------- */}
      {passOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setPassOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/75
                       p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <button
              onClick={() => setPassOpen(false)}
              className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center
                         rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>

            <h2 className="font-display text-2xl font-extrabold text-ink">
              تغيير كلمة السر
            </h2>

            <form
              onSubmit={handlePasswordSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  كلمة السر الحالية
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  كلمة السر الجديدة
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  تأكيد كلمة السر الجديدة
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3
                             text-ink outline-none transition focus:border-amber-600/60
                             focus:bg-white focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              {passError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="rounded-2xl border border-green-200 bg-green-50/80 px-4 py-3 text-sm font-medium text-green-700">
                  {passSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={passSubmitting}
                className="mt-2 w-full rounded-2xl bg-ink py-3.5 text-base font-semibold text-white
                           shadow-lg shadow-ink/15 transition hover:bg-amber-700 hover:shadow-amber-700/25
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passSubmitting ? 'جارِ الحفظ...' : 'تغيير كلمة السر'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Logout confirm modal ---------------- */}
      {logoutOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setLogoutOpen(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-in 0.25s ease-out' }}
            className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/75
                       p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <span className="text-4xl">🚪</span>
            <h2 className="font-display mt-3 text-xl font-extrabold text-ink">
              متأكد إنك عايز تسجل خروج؟
            </h2>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setLogoutOpen(false)}
                className="flex-1 rounded-2xl border-2 border-ink/15 py-4 text-base font-bold
                           text-ink transition hover:bg-ink/5"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 rounded-2xl bg-red-600 py-4 text-base font-bold text-white
                           shadow-lg shadow-red-600/20 transition hover:bg-red-700
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? 'جارِ الخروج...' : 'تسجيل خروج'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default teacherDetails;
