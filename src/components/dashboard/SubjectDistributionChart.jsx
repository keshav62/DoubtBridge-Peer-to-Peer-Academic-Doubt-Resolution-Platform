'use client';

import { BookOpen } from 'lucide-react';

const BAR_COLORS = [
  'bg-[#2563EB]', // Blue
  'bg-[#7C3AED]', // Violet
  'bg-[#059669]', // Emerald
  'bg-[#D97706]', // Amber
  'bg-[#0891B2]', // Cyan
  'bg-[#E11D48]', // Rose
  'bg-[#4F46E5]', // Indigo
  'bg-[#475569]', // Slate
];

export default function SubjectDistributionChart({ data = [] }) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-[#101B3D] flex items-center gap-2">
            <BookOpen size={17} className="text-[#2563EB]" />
            Subject Distribution
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Most active academic disciplines by question volume
          </p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((item, index) => {
            const barWidth = Math.max(Math.round((item.count / maxCount) * 100), 4);
            const colorClass = BAR_COLORS[index % BAR_COLORS.length];

            return (
              <div key={item.subject} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#101B3D] truncate group-hover:text-[#2563EB] transition-colors">
                    {item.subject}
                  </span>
                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="font-bold text-[#101B3D]">
                      {item.count} {item.count === 1 ? 'doubt' : 'doubts'}
                    </span>
                    <span className="text-[0.7rem] font-medium text-[#64748B] w-9">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#64748B]">
          No subject data available.
        </div>
      )}
    </div>
  );
}

