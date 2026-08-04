import { Link } from 'react-router-dom';

const RANK_ICON = ['🥇', '🥈', '🥉'];

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
  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/40 p-5
                 shadow-lg shadow-black/5 backdrop-blur-xl transition hover:bg-white/55
                 lg:flex-row lg:items-center lg:justify-between"
    >
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
          <p className="font-display whitespace-nowrap text-lg font-bold text-ink">
            {student.name}
          </p>
          <p className="text-xs font-medium text-amber-700">XP: {student.xp}</p>
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
  );
};

export default OneStudent;
