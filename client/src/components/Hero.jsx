import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
const Hero = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 md:px-12">
      <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-6">
        {/* Photo — left */}
        <div className="order-1 flex justify-center md:justify-start">
          <div className="relative">
            <div
              className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2
                           rounded-full bg-amber-200/50 blur-3xl md:h-96 md:w-96"
            />
            <img
              src="/mahmoud.png"
              alt="الأستاذ محمود بهاء"
              className="relative h-[380px] w-auto object-contain drop-shadow-2xl md:h-[540px]"
            />
          </div>
        </div>

        {/* Text — right */}
        <div dir="rtl" className="order-2 text-right">
          <span
            className="mb-4 inline-block rounded-full border border-white/60 bg-white/50
                         px-4 py-1 text-sm font-medium text-amber-800 backdrop-blur-sm"
          >
            منصة الإيمان التعليمية
          </span>

          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink md:text-5xl lg:text-6xl">
            أهلاً بيك يا أستاذ محمود 👋
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70 md:mr-0 md:ml-auto md:text-xl">
            من هنا تقدر تتابع بياناتك وتدير طلابك بكل سهولة، كل حاجة محتاجها في
            مكان واحد.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link to="/profile">
                  <button
                    dir="rtl"
                    className="rounded-full bg-amber-400 px-7 py-3 text-base font-semibold text-white
                           shadow-lg shadow-ink/10 transition hover:bg-amber-700 hover:shadow-amber-700/20"
                  >
                    الملف الشخصي
                  </button>
                </Link>
                <Link to="/grades">
                  <button
                    className="rounded-full border-2 border-ink px-7 py-3 text-base font-semibold text-ink
                           transition hover:bg-ink hover:text-white"
                  >
                    تحكم بطلابك
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <button
                    className="rounded-full bg-ink px-7 py-3 text-base font-semibold text-white
                           shadow-lg shadow-ink/10 transition hover:bg-amber-700 hover:shadow-amber-700/20"
                  >
                    سجل دخول
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
