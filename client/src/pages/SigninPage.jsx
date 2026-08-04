import api from '../api/axios.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
const SigninPage = () => {
  const [formData, setFormDate] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormDate({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/signIN', formData);
      login(data.user, data.accessToken);
      navigate('/');
    } catch (err) {
      if (err.response.data.error) {
        setError(err.response.data.error[0].msg);
      } else {
        setError(err.response.data.message);
        console.log(err.response.data);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div dir="ltr" className="relative min-h-screen overflow-hidden">
        <img
          src="/backGround.png"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />

        <div className="flex min-h-screen items-center justify-center px-6">
          <div
            dir="rtl"
            className="w-full max-w-[450px] rounded-3xl border border-white/60
                       bg-white/40 p-8 shadow-2xl shadow-black/10 backdrop-blur-2xl
                       sm:p-10"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <span className="font-display mb-5 text-sm font-bold tracking-wide text-amber-700">
                الإيمان
              </span>
              <p className="font-display text-3xl font-extrabold text-ink">
                تسجيل الدخول
              </p>
              <span className="mt-3 text-sm leading-relaxed text-ink/60">
                من هنا تقدر تسجّل دخول من خلال الإيميل وكلمة السر
              </span>
            </div>

            {/* Form */}
            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 text-center border border-red-100">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3
                             text-right text-ink placeholder:text-ink/30
                             outline-none transition focus:border-amber-600/60 focus:bg-white/80
                             focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  كلمة السر
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3
                             text-ink placeholder:text-ink/30
                             outline-none transition focus:border-amber-600/60 focus:bg-white/80
                             focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-ink/70">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/70 accent-amber-700"
                  />
                  فتذكرني
                </label>
                <button
                  type="button"
                  className="font-medium text-amber-700 transition hover:text-ink"
                >
                  نسيت كلمة السر؟
                </button>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-amber-400 py-3.5 text-base font-semibold
                           text-white shadow-lg shadow-ink/15 transition
                           hover:bg-amber-700 hover:shadow-amber-700/25"
              >
                {loading ? 'جاري تسجيل الدخول ...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SigninPage;
