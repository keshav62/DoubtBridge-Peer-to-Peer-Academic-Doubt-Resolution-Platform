import { BookOpen, Eye, User, Search, ArrowRight, GraduationCap } from 'lucide-react';

export const metadata = {
  title: 'Knowledge Hub — DoubtBridge',
};

export default function KnowledgeBasePage() {
  const articles = [
    {
      id: 'kb-1',
      title: 'Mastering Asymptotic Notation (Big-O, Big-Theta, Big-Omega)',
      subject: 'Computer Science',
      author: 'Dr. Priya Sharma',
      views: 342,
      approved: true,
      summary:
        'A foundational walkthrough of worst-case, tight-bound, and best-case analysis with recurrence relations.',
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: 'kb-2',
      title: 'Step-by-Step Proof of the Mean Value Theorem',
      subject: 'Mathematics',
      author: 'Alex Rivera',
      views: 189,
      approved: true,
      summary:
        "Geometric intuition and formal epsilon-delta continuity requirements for Rolle's Theorem and MVT.",
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-violet-600',
    },
    {
      id: 'kb-3',
      title: 'Navier-Stokes Equations Simplified for Laminar Flow',
      subject: 'Fluid Dynamics',
      author: 'Samir Patel',
      views: 215,
      approved: true,
      summary:
        'How to eliminate zero-velocity components in cylindrical pipes and solve Poiseuille flow problems.',
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#10B981]',
    },
  ];

  const subjects = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Fluid Dynamics'];

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">Knowledge Hub</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Find useful explanations and revisit concepts whenever you need them.
        </p>
      </div>

      {/* ── Search + filters ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Search knowledge articles..."
            className="h-10 w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {subjects.map((s, i) => (
            <button
              key={s}
              type="button"
              className={[
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                i === 0
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : 'border-[#E5EAF2] bg-white text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB]',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Article cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {articles.map((item) => {
          const Icon = BookOpen;
          return (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl border border-[#E5EAF2] bg-white p-6 transition-all hover:border-[#BFDBFE] hover:shadow-sm group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
                {item.approved && (
                  <span className="inline-flex items-center rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 text-[0.65rem] font-semibold text-[#059669]">
                    ✓ Approved
                  </span>
                )}
              </div>

              {/* Subject tag */}
              <span className="mb-2 self-start inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]">
                {item.subject}
              </span>

              {/* Title */}
              <h2 className="text-sm font-bold text-[#101B3D] leading-snug mb-2 flex-1">
                {item.title}
              </h2>

              {/* Summary */}
              <p className="text-xs text-[#64748B] leading-relaxed mb-4 line-clamp-3">
                {item.summary}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 mt-auto">
                <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {item.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} />
                    {item.views}
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Read more <ArrowRight size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#BFDBFE] bg-[#F8FAFC] py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
            <GraduationCap size={26} className="text-[#2563EB]" />
          </div>
          <h3 className="text-base font-semibold text-[#101B3D]">No articles yet</h3>
          <p className="mt-1 text-sm text-[#64748B]">Knowledge resources will appear here once approved.</p>
        </div>
      )}
    </div>
  );
}
