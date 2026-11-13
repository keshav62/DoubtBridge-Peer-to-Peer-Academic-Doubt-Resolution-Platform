'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  Trophy,
  HelpCircle,
  MessageSquare,
  Shield,
  ChevronLeft,
  ExternalLink,
  Activity,
  UserCheck,
  UserX,
} from 'lucide-react';
import AdminAccountStatusBadge from '@/components/admin/AdminAccountStatusBadge';
import AdminRoleSelector from '@/components/admin/AdminRoleSelector';
import { timeAgo } from '@/lib/utils';

export default function AdminUserDetailPage({ params }) {
  const resolvedParams = use(params);
  const userId = resolvedParams?.userId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to load user profile.');
        return;
      }
      setData(json);
    } catch {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserDetail();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="h-48 rounded-2xl bg-white border border-[#E5EAF2] p-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-white border border-[#E5EAF2] animate-pulse" />
          <div className="h-64 rounded-2xl bg-white border border-[#E5EAF2] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-sm font-bold text-red-600 mb-2">Error Loading Profile</p>
        <p className="text-xs text-[#64748B] mb-4">{error || 'User not found.'}</p>
        <Link
          href="/admin/users"
          className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs"
        >
          Return to User Directory
        </Link>
      </div>
    );
  }

  const { user, auditLogs = [] } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
      >
        <ChevronLeft size={14} /> Back to Users
      </Link>

      {/* Profile Card Header */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-xl font-bold text-white shadow-md shadow-blue-500/20">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#101B3D]">{user.name}</h1>
                <AdminAccountStatusBadge
                  isActive={user.isActive}
                  suspensionReason={user.suspensionReason}
                />
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Building size={13} className="text-[#94A3B8]" />
                  {user.department || 'General Department'}
                </span>
                {user.academicYear && (
                  <span className="flex items-center gap-1">
                    <GraduationCap size={13} className="text-[#94A3B8]" />
                    {user.academicYear}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#94A3B8]" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <AdminRoleSelector
              currentRole={user.role}
              userId={user.id}
              userName={user.name}
              onRoleChanged={() => fetchUserDetail()}
            />
          </div>
        </div>

        {/* Counts summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E5EAF2]">
          <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
            <p className="text-xs text-[#64748B]">Peer Reputation</p>
            <p className="text-lg font-black text-[#2563EB] mt-0.5">{user.reputation} Rep</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
            <p className="text-xs text-[#64748B]">Questions Asked</p>
            <p className="text-lg font-black text-[#101B3D] mt-0.5">{user._count?.askedDoubts || 0}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
            <p className="text-xs text-[#64748B]">Answers Given</p>
            <p className="text-lg font-black text-[#101B3D] mt-0.5">{user._count?.answers || 0}</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
            <p className="text-xs text-[#64748B]">Helper Assignments</p>
            <p className="text-lg font-black text-[#101B3D] mt-0.5">{user._count?.doubtAssignments || 0}</p>
          </div>
        </div>
      </div>

      {/* Two columns: Questions & Answers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Doubts Asked */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-[#101B3D] mb-3 flex items-center gap-2">
            <HelpCircle size={16} className="text-[#2563EB]" />
            Recent Doubts Created ({user.askedDoubts?.length || 0})
          </h2>

          {user.askedDoubts?.length === 0 ? (
            <p className="text-xs text-[#64748B] py-6 text-center">No doubts created yet.</p>
          ) : (
            <div className="divide-y divide-[#E5EAF2]">
              {user.askedDoubts?.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="truncate max-w-xs">
                    <Link
                      href={`/doubts/${d.id}`}
                      className="text-xs font-bold text-[#101B3D] hover:text-[#2563EB] transition-colors truncate block"
                    >
                      {d.title}
                    </Link>
                    <span className="text-[0.65rem] text-[#64748B]">{d.subject} • {timeAgo(d.createdAt)}</span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-[#344568]">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Answers Submitted */}
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-[#101B3D] mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-600" />
            Recent Answers Contributed ({user.answers?.length || 0})
          </h2>

          {user.answers?.length === 0 ? (
            <p className="text-xs text-[#64748B] py-6 text-center">No answers submitted yet.</p>
          ) : (
            <div className="divide-y divide-[#E5EAF2]">
              {user.answers?.map((ans) => (
                <div key={ans.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="truncate max-w-xs">
                    <Link
                      href={`/doubts/${ans.doubtId}`}
                      className="text-xs font-bold text-[#101B3D] hover:text-[#2563EB] transition-colors truncate block"
                    >
                      {ans.doubt?.title}
                    </Link>
                    <span className="text-[0.65rem] text-[#64748B]">
                      {ans.upvotes} upvotes • {ans.isAccepted ? 'Accepted Solution' : ans.status}
                    </span>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[0.65rem] font-semibold ${
                      ans.isAccepted
                        ? 'bg-amber-100 text-amber-800'
                        : ans.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ans.isAccepted ? 'Accepted' : ans.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Administrative Audit Trail for this user */}
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-[#101B3D] mb-3 flex items-center gap-2">
          <Activity size={16} className="text-purple-600" />
          Administrative Audit Trail for User
        </h2>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-[#64748B] py-6 text-center">No administrative changes recorded for this account.</p>
        ) : (
          <div className="divide-y divide-[#E5EAF2]">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#101B3D]">{log.action}</span>
                  <p className="text-[0.65rem] text-[#64748B]">
                    By Admin {log.actor?.name} • {log.metadata}
                  </p>
                </div>
                <span className="text-[0.65rem] text-[#94A3B8]">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

