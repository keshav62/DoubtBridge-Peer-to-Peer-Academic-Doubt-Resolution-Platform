'use client';

import {
  Award,
  CheckCircle,
  MessageSquare,
  Clock,
  BookOpen,
  Edit3,
  Power,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function HelperProfileCard({
  profileData = {},
  onToggleAvailability,
  isToggling = false,
  onOpenEdit,
}) {
  const { user = {}, stats = {}, isAvailable = true, subjects = '', expertise = '', bio = '' } = profileData;
  const subjectsList = subjects ? subjects.split(',').filter(Boolean) : [];
  const expertiseList = expertise ? expertise.split(',').filter(Boolean) : [];

  const initials = (user.name || 'Helper')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5EAF2] pb-6">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-[#BFDBFE]"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-xl font-bold text-white shadow-sm">
              {initials}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#101B3D]">{user.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                <Sparkles size={11} />
                {user.role}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {user.department || 'Academic Department'} · {user.academicYear || 'University Peer'}
            </p>
            <p className="text-xs text-[#94A3B8]">{user.email}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Availability Toggle */}
          <button
            type="button"
            disabled={isToggling}
            onClick={onToggleAvailability}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
              isAvailable
                ? 'border-emerald-200 bg-[#ECFDF5] text-emerald-800 hover:bg-emerald-100'
                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Power size={13} className={isAvailable ? 'text-emerald-600' : 'text-amber-600'} />
            <span>{isAvailable ? 'Status: Available' : 'Status: Paused'}</span>
          </button>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={onOpenEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-bold text-[#101B3D] hover:bg-[#F8FAFC] hover:border-[#BFDBFE] transition-all shadow-xs"
          >
            <Edit3 size={13} className="text-[#2563EB]" />
            <span>Edit Expertise</span>
          </button>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="py-4 border-b border-[#E5EAF2]">
          <h4 className="text-xs font-bold text-[#344568] uppercase tracking-wider mb-1">
            Biography
          </h4>
          <p className="text-xs text-[#475569] leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Helper Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-b border-[#E5EAF2]">
        <div className="rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] p-3 text-center">
          <div className="flex items-center justify-center text-amber-500 mb-1">
            <Award size={18} />
          </div>
          <div className="text-lg font-black text-[#101B3D]">{stats.reputation ?? 0}</div>
          <div className="text-[0.7rem] text-[#64748B] font-medium">Reputation Points</div>
        </div>

        <div className="rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] p-3 text-center">
          <div className="flex items-center justify-center text-[#10B981] mb-1">
            <CheckCircle size={18} />
          </div>
          <div className="text-lg font-black text-[#101B3D]">{stats.acceptedAnswers ?? 0}</div>
          <div className="text-[0.7rem] text-[#64748B] font-medium">Accepted Solutions</div>
        </div>

        <div className="rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] p-3 text-center">
          <div className="flex items-center justify-center text-[#2563EB] mb-1">
            <MessageSquare size={18} />
          </div>
          <div className="text-lg font-black text-[#101B3D]">{stats.totalAnswers ?? 0}</div>
          <div className="text-[0.7rem] text-[#64748B] font-medium">Total Answers</div>
        </div>

        <div className="rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] p-3 text-center">
          <div className="flex items-center justify-center text-cyan-600 mb-1">
            <Clock size={18} />
          </div>
          <div className="text-lg font-black text-[#101B3D]">
            {stats.activeAssignmentsCount ?? 0} / {stats.workloadLimit ?? 5}
          </div>
          <div className="text-[0.7rem] text-[#64748B] font-medium">Active Assignments</div>
        </div>
      </div>

      {/* Subjects & Expertise Section */}
      <div className="pt-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-[#344568] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen size={13} className="text-[#2563EB]" />
            Qualified Academic Subjects
          </h4>
          {subjectsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subjectsList.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 text-xs font-bold text-[#2563EB]"
                >
                  {sub}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">
              No subjects added yet. Add subjects to receive matched doubt recommendations.
            </p>
          )}
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#344568] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#10B981]" />
            Topics & Specializations
          </h4>
          {expertiseList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {expertiseList.map((exp) => (
                <span
                  key={exp}
                  className="inline-flex items-center rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 text-xs font-semibold text-[#059669]"
                >
                  {exp}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">
              No topics specified yet. Specifying topics increases match scores up to +50 points.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
