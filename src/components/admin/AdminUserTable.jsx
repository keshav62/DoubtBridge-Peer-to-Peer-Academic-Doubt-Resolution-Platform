'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, UserX, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import AdminAccountStatusBadge from './AdminAccountStatusBadge';
import AdminRoleSelector from './AdminRoleSelector';

export default function AdminUserTable({ users, loading, onUserUpdated, currentAdminId }) {
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  const handleToggleStatus = async () => {
    if (!statusModalUser) return;
    setStatusLoading(true);
    setStatusError('');

    const newActiveState = !statusModalUser.isActive;

    try {
      const res = await fetch(`/api/admin/users/${statusModalUser.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: newActiveState,
          suspensionReason: newActiveState ? '' : suspensionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusError(data.error || 'Failed to update user account status.');
        setStatusLoading(false);
        return;
      }

      if (onUserUpdated) onUserUpdated(data.user);
      setStatusModalUser(null);
      setSuspensionReason('');
    } catch {
      setStatusError('Network error occurred.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white p-12 text-center">
        <p className="text-sm font-bold text-[#101B3D]">No users found</p>
        <p className="text-xs text-[#64748B] mt-1">Try adjusting your search criteria or role filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-[#E5EAF2] bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5EAF2] bg-[#F8FAFC]">
              <th className="py-3.5 pl-5 pr-3 font-semibold text-[#64748B] uppercase tracking-wider">User</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Role</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Department</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Activity</th>
              <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
              <th className="py-3.5 pl-3 pr-5 text-right font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAF2]">
            {users.map((u) => {
              const isSelf = u.id === currentAdminId;

              return (
                <tr key={u.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  {/* User details */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-[0.7rem] font-bold text-white flex-shrink-0">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="font-bold text-[#101B3D] hover:text-[#2563EB] transition-colors"
                          >
                            {u.name}
                          </Link>
                          {isSelf && (
                            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-[#2563EB]">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[#64748B] text-[0.7rem]">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-3 py-3.5">
                    {isSelf ? (
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                        {u.role}
                      </span>
                    ) : (
                      <AdminRoleSelector
                        currentRole={u.role}
                        userId={u.id}
                        userName={u.name}
                        onRoleChanged={(updated) => onUserUpdated && onUserUpdated(updated)}
                      />
                    )}
                  </td>

                  {/* Department */}
                  <td className="px-3 py-3.5 text-[#344568]">
                    <span className="font-medium">{u.department || '—'}</span>
                    {u.academicYear && (
                      <span className="block text-[0.65rem] text-[#94A3B8]">{u.academicYear}</span>
                    )}
                  </td>

                  {/* Activity Stats */}
                  <td className="px-3 py-3.5 text-[#64748B]">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#101B3D]">{u.reputation} Rep</span>
                      <div className="flex items-center gap-2 text-[0.65rem]">
                        <span>{u._count?.askedDoubts || 0} doubts</span>
                        <span>•</span>
                        <span>{u._count?.answers || 0} answers</span>
                      </div>
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="px-3 py-3.5">
                    <AdminAccountStatusBadge
                      isActive={u.isActive}
                      suspensionReason={u.suspensionReason}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/users/${u.id}`}
                        title="View user academic history"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAF2] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101B3D] transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>

                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusModalUser(u);
                            setSuspensionReason(u.suspensionReason || '');
                            setStatusError('');
                          }}
                          title={u.isActive ? 'Suspend account' : 'Reactivate account'}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                            u.isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Account Status Modal (Suspend / Activate) */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101B3D]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  statusModalUser.isActive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {statusModalUser.isActive ? <UserX size={20} /> : <UserCheck size={20} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101B3D]">
                  {statusModalUser.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
                </h3>
                <p className="text-xs text-[#64748B]">{statusModalUser.name} ({statusModalUser.email})</p>
              </div>
            </div>

            {statusError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            {statusModalUser.isActive ? (
              <div className="space-y-3 mb-6">
                <p className="text-xs text-[#64748B]">
                  Suspending this user will immediately revoke platform authentication access and block doubt/answer submissions. Historical academic contributions will remain preserved.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#344568] mb-1">
                    Suspension Reason
                  </label>
                  <textarea
                    rows={3}
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Enter reason for suspension (visible to administrators)..."
                    className="w-full rounded-xl border border-[#E5EAF2] p-2.5 text-xs text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] mb-6">
                Reactivating this account will restore full sign-in permissions and permit academic doubt resolution according to their role ({statusModalUser.role}).
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={statusLoading}
                onClick={() => setStatusModalUser(null)}
                className="rounded-xl border border-[#E5EAF2] px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusLoading}
                onClick={handleToggleStatus}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors ${
                  statusModalUser.isActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusLoading && <Loader2 size={14} className="animate-spin" />}
                {statusModalUser.isActive ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
