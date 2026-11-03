import { ShieldCheck, AlertTriangle, Clock, CheckCircle, XCircle, Flag } from 'lucide-react';

export const metadata = {
  title: 'Moderation Center — DoubtBridge',
};

export default function ModerationPage() {
  const flags = [
    {
      id: 'rep-1',
      type: 'Doubt',
      reason: 'Suspected exam question posted during live midterm testing hours.',
      targetTitle: 'Solve for eigenvector in question 4b of current Math exam',
      reportedBy: 'Elena Rostova',
      status: 'PENDING',
    },
    {
      id: 'rep-2',
      type: 'Answer',
      reason: 'Spam / promotional external tutoring link in response body.',
      targetTitle: 'Re: Physics derivation question',
      reportedBy: 'Alex Rivera',
      status: 'PENDING',
    },
  ];

  const stats = [
    { label: 'Pending Review', value: flags.length.toString(), icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Reviewed Today', value: '12', icon: CheckCircle, bg: 'bg-[#ECFDF5]', color: 'text-[#10B981]' },
    { label: 'Total Reports', value: '48', icon: Flag, bg: 'bg-red-50', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
          <ShieldCheck size={22} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            Moderation Center
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Review answers and help maintain a reliable learning resource.
          </p>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
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

      {/* ── Reports queue ────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#E5EAF2] px-6 py-4">
          <AlertTriangle size={17} className="text-amber-500 flex-shrink-0" />
          <h2 className="text-base font-bold text-[#101B3D]">
            Pending Reports ({flags.length})
          </h2>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {flags.map((flag) => (
            <div key={flag.id} className="p-6 hover:bg-[#F8FAFC] transition-colors">
              {/* Report header */}
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                    {flag.type} Report
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Reported by <span className="font-semibold text-[#344568]">{flag.reportedBy}</span>
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Clock size={10} className="mr-1" />
                  {flag.status}
                </span>
              </div>

              {/* Target title */}
              <h3 className="text-sm font-semibold text-[#101B3D] mb-2">{flag.targetTitle}</h3>

              {/* Reason */}
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                <span className="font-semibold text-[#344568]">Reason:</span> {flag.reason}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  <XCircle size={13} />
                  Remove Content
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-4 py-2 text-xs font-semibold text-[#059669] hover:bg-[#D1FAE5] transition-colors"
                >
                  <CheckCircle size={13} />
                  Approve
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-full border border-[#E5EAF2] bg-white px-4 py-2 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] transition-colors"
                >
                  Dismiss Flag
                </button>
              </div>
            </div>
          ))}
        </div>

        {flags.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECFDF5]">
              <CheckCircle size={26} className="text-[#10B981]" />
            </div>
            <h3 className="text-base font-semibold text-[#101B3D]">All clear!</h3>
            <p className="mt-1 text-sm text-[#64748B]">No pending reports to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
