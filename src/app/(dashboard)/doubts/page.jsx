import Link from 'next/link';
import { Plus, HelpCircle, ArrowRight, Search, Filter } from 'lucide-react';

export const metadata = {
  title: 'My Doubts — DoubtBridge',
};

export default function DoubtsListPage() {
  const sampleDoubts = [
    {
      id: 'd1',
      title: 'How does Dijkstra algorithm handle negative weight cycles?',
      subject: 'Algorithms',
      status: 'CLAIMED',
      urgency: 'HIGH',
      author: 'Alex Rivera',
      answersCount: 1,
      date: '2h ago',
    },
    {
      id: 'd2',
      title: 'Evaluating improper integrals with infinite discontinuities',
      subject: 'Calculus',
      status: 'OPEN',
      urgency: 'MEDIUM',
      author: 'Maya Lin',
      answersCount: 0,
      date: '1d ago',
    },
    {
      id: 'd3',
      title: 'Deriving the Maxwell-Boltzmann distribution from partition functions',
      subject: 'Physics',
      status: 'RESOLVED',
      urgency: 'LOW',
      author: 'Samir Patel',
      answersCount: 3,
      date: '3d ago',
    },
  ];

  const STATUS_STYLES = {
    OPEN:     'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    CLAIMED:  'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-[#EDE9FE] text-violet-700 border-violet-200',
  };

  const URGENCY_STYLES = {
    HIGH:   'text-red-600',
    MEDIUM: 'text-amber-600',
    LOW:    'text-[#64748B]',
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">My Doubts</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Track your questions and follow their progress.
          </p>
        </div>
        <Link
          href="/doubts/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Ask a Doubt
        </Link>
      </div>

      {/* ── Search + filter bar ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Search doubts..."
            className="h-10 w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-3 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E5EAF2] bg-white text-sm font-medium text-[#344568] hover:bg-[#F8FAFC] transition-colors"
        >
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* ── Doubts list ─────────────────────────────────────── */}
      <div className="space-y-3">
        {sampleDoubts.map((doubt) => (
          <div
            key={doubt.id}
            className="rounded-2xl border border-[#E5EAF2] bg-white p-5 transition-all hover:border-[#BFDBFE] hover:shadow-sm group"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left content */}
              <div className="min-w-0 flex-1">
                {/* Tags row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[doubt.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                  >
                    {doubt.status}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 text-xs font-semibold">
                    {doubt.subject}
                  </span>
                  <span className={`text-xs font-medium ${URGENCY_STYLES[doubt.urgency] ?? 'text-[#64748B]'}`}>
                    {doubt.urgency} urgency
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-base font-semibold text-[#101B3D] leading-snug mb-1.5">
                  {doubt.title}
                </h2>

                {/* Meta */}
                <p className="text-xs text-[#64748B]">
                  Asked by {doubt.author} · {doubt.answersCount}{' '}
                  {doubt.answersCount === 1 ? 'answer' : 'answers'} · {doubt.date}
                </p>
              </div>

              {/* Right action */}
              <Link
                href={`/doubts/${doubt.id}`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#344568] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all whitespace-nowrap"
              >
                View Details
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sampleDoubts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#BFDBFE] bg-[#F8FAFC] py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
            <HelpCircle size={26} className="text-[#2563EB]" />
          </div>
          <h3 className="text-base font-semibold text-[#101B3D]">No doubts yet</h3>
          <p className="mt-1 max-w-xs text-sm text-[#64748B]">
            Post your first doubt and connect with a peer helper.
          </p>
          <Link
            href="/doubts/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-all"
          >
            <Plus size={15} />
            Ask a Doubt
          </Link>
        </div>
      )}
    </div>
  );
}
