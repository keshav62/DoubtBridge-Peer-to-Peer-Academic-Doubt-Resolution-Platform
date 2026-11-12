'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function DoubtTrendChart({
  data = [],
  days = 30,
  onDaysChange,
  isLoading = false,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const totalDoubtsInRange = data.reduce((acc, cur) => acc + (cur.count || 0), 0);
  const maxCount = Math.max(...data.map((d) => d.count || 0), 4);

  // SVG dimensions
  const width = 640;
  const height = 200;
  const paddingX = 35;
  const paddingTop = 25;
  const paddingBottom = 35;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x =
      data.length > 1
        ? paddingX + (index / (data.length - 1)) * innerWidth
        : width / 2;
    const y = paddingTop + innerHeight - ((d.count || 0) / maxCount) * innerHeight;
    return { ...d, x, y };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
    : '';

  // Select evenly distributed x-axis label indices (e.g. 5-7 labels)
  const step = Math.max(1, Math.floor(data.length / 5));
  const labeledIndices = data.map((_, i) => i).filter((i) => i % step === 0 || i === data.length - 1);

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-[#101B3D] flex items-center gap-2">
            <TrendingUp size={17} className="text-[#2563EB]" />
            Doubt Creation Trend
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {totalDoubtsInRange} doubts created over the last {days} days
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-[#F1F5F9] p-1 self-start sm:self-auto">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDaysChange && onDaysChange(d)}
              disabled={isLoading}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                days === d
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-[#64748B] hover:text-[#101B3D]'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        {data.length > 0 ? (
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.5, 1].map((ratio) => {
                const y = paddingTop + innerHeight * (1 - ratio);
                const val = Math.round(maxCount * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1.2"
                      strokeDasharray={ratio > 0 ? '4 4' : 'none'}
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94A3B8"
                      fontFamily="inherit"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {areaD && <path d={areaD} fill="url(#trendGradient)" />}

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={p.date} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint === idx ? 6 : p.count > 0 ? 3.5 : 2}
                    fill={hoveredPoint === idx ? '#1D4ED8' : '#2563EB'}
                    stroke="#FFFFFF"
                    strokeWidth={hoveredPoint === idx ? 2.5 : 1.5}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="transition-all"
                  />
                  {/* Invisible hit area for hover */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={14}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {labeledIndices.map((idx) => {
                const p = points[idx];
                if (!p) return null;
                return (
                  <text
                    key={p.date}
                    x={p.x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#64748B"
                    fontFamily="inherit"
                    fontWeight="500"
                  >
                    {p.label}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && points[hoveredPoint] && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-[#101B3D] text-white text-[0.7rem] shadow-lg z-10 whitespace-nowrap"
                style={{
                  left: `${(points[hoveredPoint].x / width) * 100}%`,
                  top: `${(points[hoveredPoint].y / height) * 100 - 8}%`,
                }}
              >
                <div className="font-bold">
                  {points[hoveredPoint].count}{' '}
                  {points[hoveredPoint].count === 1 ? 'doubt' : 'doubts'}
                </div>
                <div className="text-[0.65rem] text-slate-300">
                  {points[hoveredPoint].label} ({points[hoveredPoint].date})
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-14 text-center text-xs text-[#64748B]">
            No trend data available for this range.
          </div>
        )}
      </div>
    </div>
  );
}

