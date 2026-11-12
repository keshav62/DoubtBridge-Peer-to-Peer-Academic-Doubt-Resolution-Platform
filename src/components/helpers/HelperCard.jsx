'use client';

import { Star, CheckCircle, MessageSquare, Award } from 'lucide-react';

export default function HelperCard({ helper, onRequestHelp }) {
  const isAvailable = helper.isAvailable !== false;
  const subjects = helper.subjects ? helper.subjects.split(',').filter(Boolean) : [];
  const initials = (helper.name || 'Helper')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5EAF2] bg-white p-6 transition-all hover:border-[#BFDBFE] hover:shadow-xs group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {helper.avatar ? (
            <img
              src={helper.avatar}
              alt={helper.name}
              className="h-12 w-12 rounded-full object-cover border border-[#E5EAF2]"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-sm font-bold text-white shadow-xs">
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-[#101B3D] group-hover:text-[#2563EB] transition-colors">
              {helper.name}
            </h3>
            {helper.department && (
              <p className="text-xs text-[#64748B]">{helper.department}</p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-[#101B3D]">
                {helper.reputation || 0}
              </span>
              <span className="text-[0.65rem] text-[#94A3B8]">Rep</span>
            </div>
          </div>
        </div>

        {/* Availability status badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${
            isAvailable
              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAvailable ? 'bg-[#10B981]' : 'bg-amber-500'
            }`}
          />
          {isAvailable ? 'Available' : 'Busy'}
        </span>
      </div>

      {/* Bio / Expertise preview */}
      {(helper.bio || helper.expertise) && (
        <p className="text-xs text-[#475569] line-clamp-2 mb-4 italic">
          "{helper.bio || helper.expertise}"
        </p>
      )}

      {/* Stats summary */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-[#F8FAFC] p-2.5 text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-[#10B981]" />
          <span>
            <strong className="text-[#101B3D]">{helper.acceptedAnswers || 0}</strong> solutions
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={13} className="text-[#2563EB]" />
          <span>
            <strong className="text-[#101B3D]">{helper.totalAnswers || 0}</strong> answers
          </span>
        </div>
      </div>

      {/* Subject tags */}
      <div className="flex flex-wrap gap-1.5 mb-5 flex-1 items-start content-start">
        {subjects.slice(0, 4).map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/60 px-2 py-0.5 text-[0.7rem] font-semibold text-[#2563EB]"
          >
            {s}
          </span>
        ))}
        {subjects.length > 4 && (
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-1.5 py-0.5 text-[0.65rem] text-[#64748B]">
            +{subjects.length - 4} more
          </span>
        )}
      </div>

      {/* Action button */}
      <button
        type="button"
        disabled={!isAvailable}
        onClick={() => onRequestHelp && onRequestHelp(helper)}
        className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
          isAvailable
            ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Award size={13} />
        {isAvailable ? 'Request Academic Help' : 'Currently Unavailable'}
      </button>
    </div>
  );
}
