import { Link } from 'react-router-dom';

const RANK_ICON = ['🥇', '🥈', '🥉'];
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

const ActionButton = ({ label, emoji, onClick, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border
                px-4 py-2.5 text-sm font-semibold transition
                ${
                  danger
                    ? 'border-red-200 bg-red-50/80 text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white'
                    : 'border-white/70 bg-white/70 text-ink hover:bg-ink hover:text-white'
                }`}
  >
    <span className="text-base leading-none">{emoji}</span>
    {label}
  </button>
);

const OneStudent = ({ student, rank, onEdit, onDelete, onAction }) => {
  const paidMonths = (student.payments || [])
    .filter((p) => p.isPaid)
    .map((p) => MONTHS[p.month - 1])
    .filter(Boolean);

  const exams = student.exams || [];

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/40 p-5
                 shadow-lg shadow-black/5 backdrop-blur-xl transition hover:bg-white/55"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Identity */}
        <Link
          to={`/students/${student._id}`}
          className="flex shrink-0 items-center gap-3 rounded-2xl transition hover:opacity-80"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center text-2xl">
            {rank < 3 ? (
              RANK_ICON[rank]
            ) : (
              <span className="text-sm font-bold text-ink/30">#{rank + 1}</span>
            )}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display whitespace-nowrap text-lg font-bold text-ink">
                {student.name}
              </p>
              {student.studying && (
                <span className="whitespace-nowrap rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-bold text-ink/60">
                  {student.studying === 'ازهر' ? 'أزهر' : student.studying}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-amber-700">
              XP: {student.xp}
            </p>
          </div>
        </Link>

        {/* Actions */}
        <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <ActionButton
            label="بداية حصة"
            emoji="▶️"
            onClick={() => onAction(student, 'attendance')}
          />
          <ActionButton
            label="إنهاء حصة"
            emoji="⏹️"
            onClick={() => onAction(student, 'session')}
          />
          <ActionButton
            label="امتحان"
            emoji="📝"
            onClick={() => onAction(student, 'exam')}
          />
          <ActionButton
            label="دفع الشهر"
            emoji="💰"
            onClick={() => onAction(student, 'payment')}
          />
          <ActionButton
            label="تعديل"
            emoji="✏️"
            onClick={() => onEdit(student)}
          />
          <ActionButton
            label="حذف"
            emoji="🗑️"
            danger
            onClick={() => onDelete(student)}
          />
        </div>
      </div>

      {/* Extra details: paid months + exam scores */}
      {(paidMonths.length > 0 || exams.length > 0) && (
        <div className="flex flex-col gap-2 border-t border-ink/10 pt-4">
          {paidMonths.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="whitespace-nowrap text-xs font-semibold text-ink/50">
                الشهور المدفوعة:
              </span>
              {paidMonths.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                >
                  {m}
                </span>
              ))}
            </div>
          )}

          {exams.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="whitespace-nowrap text-xs font-semibold text-ink/50">
                الامتحانات:
              </span>
              {exams.map((exam, i) => (
                <span
                  key={i}
                  className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink/70"
                >
                  امتحان {i + 1}: {exam.studentScore}/{exam.totalScore}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OneStudent;
