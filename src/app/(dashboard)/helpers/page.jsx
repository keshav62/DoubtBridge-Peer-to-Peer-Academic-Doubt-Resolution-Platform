import { Star, CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Help Others — DoubtBridge',
};

export default function HelpersDirectoryPage() {
  const helpers = [
    {
      id: 'h1',
      name: 'Dr. Priya Sharma',
      initials: 'PS',
      subjects: ['Algorithms', 'Linear Algebra', 'Calculus'],
      reputation: 890,
      doubtsResolved: 54,
      isAvailable: true,
      avatarGradient: 'from-[#2563EB] to-[#06B6D4]',
    },
    {
      id: 'h2',
      name: 'Elena Rostova',
      initials: 'ER',
      subjects: ['Quantum Physics', 'Thermodynamics'],
      reputation: 640,
      doubtsResolved: 38,
      isAvailable: true,
      avatarGradient: 'from-violet-500 to-purple-600',
    },
    {
      id: 'h3',
      name: 'David Kim',
      initials: 'DK',
      subjects: ['Organic Chemistry', 'Biochemistry'],
      reputation: 430,
      doubtsResolved: 25,
      isAvailable: false,
      avatarGradient: 'from-[#10B981] to-cyan-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            Help Someone Learn
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Share what you know and help classmates understand difficult concepts.
          </p>
        </div>
      </div>

      {/* ── Stats summary ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Helpers', value: '24', icon: Users, bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]' },
          { label: 'Avg. Doubts Solved', value: '39', icon: CheckCircle, bg: 'bg-[#ECFDF5]', color: 'text-[#10B981]' },
          { label: 'Avg. Response Time', value: '~2h', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-[#E5EAF2] bg-white p-4 text-center">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} ${s.color} mb-2`}>
                <Icon size={18} />
              </div>
              <div className="text-xl font-extrabold text-[#101B3D]">{s.value}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Helper cards grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {helpers.map((h) => (
          <div
            key={h.id}
            className="flex flex-col rounded-2xl border border-[#E5EAF2] bg-white p-6 transition-all hover:border-[#BFDBFE] hover:shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${h.avatarGradient} text-sm font-bold text-white`}
                >
                  {h.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#101B3D]">{h.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-[#64748B]">{h.reputation} rep</span>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${
                  h.isAvailable
                    ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {h.isAvailable ? '● Available' : '● Busy'}
              </span>
            </div>

            {/* Stats */}
            <div className="mb-4 flex items-center gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1">
                <CheckCircle size={12} className="text-[#10B981]" />
                {h.doubtsResolved} solved
              </span>
            </div>

            {/* Subject tags */}
            <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
              {h.subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-lg bg-[#F8FAFC] border border-[#E5EAF2] px-2 py-0.5 text-xs font-medium text-[#344568]"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Action button */}
            <button
              type="button"
              disabled={!h.isAvailable}
              className={[
                'w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all',
                h.isAvailable
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 hover:bg-[#1D4ED8]'
                  : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed',
              ].join(' ')}
            >
              {h.isAvailable ? (
                <>
                  Request Help
                  <ArrowRight size={14} />
                </>
              ) : (
                'Currently Busy'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
