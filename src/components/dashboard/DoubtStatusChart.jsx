'use client';

import { PieChart } from 'lucide-react';

const STATUS_CONFIG = [
  { key: 'OPEN', label: 'Open', color: '#2563EB', bg: 'bg-[#2563EB]', lightBg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
  { key: 'CLAIMED', label: 'Claimed', color: '#F59E0B', bg: 'bg-[#F59E0B]', lightBg: 'bg-amber-50', text: 'text-amber-700' },
  { key: 'ASSIGNED', label: 'Assigned', color: '#06B6D4', bg: 'bg-[#06B6D4]', lightBg: 'bg-cyan-50', text: 'text-cyan-700' },
  { key: 'ANSWERED', label: 'Answered', color: '#8B5CF6', bg: 'bg-[#8B5CF6]', lightBg: 'bg-[#EDE9FE]', text: 'text-violet-700' },
  { key: 'RESOLVED', label: 'Resolved', color: '#10B981', bg: 'bg-[#10B981]', lightBg: 'bg-[#ECFDF5]', text: 'text-emerald-700' },
  { key: 'CLOSED', label: 'Closed', color: '#64748B', bg: 'bg-[#64748B]', lightBg: 'bg-slate-100', text: 'text-slate-600' },
];

export default function DoubtStatusChart({ data = {} }) {
  const total = data.total ?? 0;

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-[#101B3D] flex items-center gap-2">
            <PieChart size={17} className="text-[#2563EB]" />
            Doubt Status Distribution
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Breakdown across all lifecycle stages ({total} total doubts)
          </p>
        </div>
      </div>

      {total > 0 ? (
        <div className="space-y-5">
          {/* Proportional Segmented Progress Bar */}
          <div className="h-4 w-full rounded-full bg-[#F1F5F9] overflow-hidden flex shadow-inner">
            {STATUS_CONFIG.map((status) => {
              const count = data[status.key] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={status.key}
                  style={{ width: `${pct}%` }}
                  className={`${status.bg} transition-all duration-500 hover:opacity-90 relative group`}
                  title={`${status.label}: ${count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {STATUS_CONFIG.map((status) => {
              const count = data[status.key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={status.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] hover:bg-white hover:border-[#BFDBFE] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-xs font-semibold text-[#344568]">
                      {status.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#101B3D] mr-1.5">
                      {count}
                    </span>
                    <span className="text-[0.7rem] text-[#94A3B8]">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#64748B]">
          No doubts available for status distribution.
        </div>
      )}
    </div>
  );
}

