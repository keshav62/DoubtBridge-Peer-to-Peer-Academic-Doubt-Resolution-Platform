'use client';

import { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export default function MatchScoreBadge({ score = 0, reasons = [] }) {
  const [showTooltip, setShowTooltip] = useState(false);

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (score >= 80) {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (score >= 50) {
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (score >= 20) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold cursor-pointer transition-all hover:shadow-xs ${badgeColor}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="flex items-center gap-1">
          {score >= 80 && <Sparkles size={11} className="text-emerald-600" />}
          {score}% Match
        </span>
        <Info size={11} className="opacity-60 hover:opacity-100" />
      </div>

      {showTooltip && reasons.length > 0 && (
        <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 z-30 w-56 rounded-xl border border-[#E5EAF2] bg-white p-3 shadow-lg text-xs">
          <p className="font-bold text-[#101B3D] mb-1.5 border-b border-[#F1F5F9] pb-1">
            Matching Breakdown
          </p>
          <ul className="space-y-1 text-[0.7rem] text-[#475569]">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#2563EB] font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
