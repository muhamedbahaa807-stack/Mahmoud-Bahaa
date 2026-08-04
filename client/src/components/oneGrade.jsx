import { Link } from 'react-router-dom';

const OneGrade = ({ grade, studentsCount, onEdit, onDelete }) => {
  return (
    <Link
      to={`/grades/${grade._id}/students`}
      state={{ gradeName: grade.name }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl
                 border border-white/60 bg-white/40 p-6 shadow-lg shadow-black/5
                 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/55
                 hover:shadow-xl hover:shadow-amber-700/10"
    >
      {/* Edit / Delete */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          title="تعديل"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(grade);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70
                     bg-white/70 text-sm transition hover:bg-ink hover:text-white"
        >
          ✏️
        </button>
        <button
          type="button"
          title="حذف"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(grade);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200
                     bg-red-50/80 text-sm text-red-600 transition hover:border-red-600
                     hover:bg-red-600 hover:text-white"
        >
          🗑️
        </button>
      </div>

      <div dir="rtl" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 pl-20">
          <span className="font-display text-xl font-bold text-ink">
            {grade.name}
          </span>
          <span className="whitespace-nowrap rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-ink/70">
            {studentsCount ?? 0} طالب
          </span>
        </div>

        {grade.session?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {grade.session.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60"
              >
                {s.day} - {s.time}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        dir="rtl"
        className="mt-6 flex items-center gap-1 text-sm font-semibold text-amber-700
                   transition-all duration-300 group-hover:gap-2"
      >
        عرض الطلاب
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
      </div>
    </Link>
  );
};

export default OneGrade;
