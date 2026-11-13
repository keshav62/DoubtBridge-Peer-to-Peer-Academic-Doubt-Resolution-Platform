'use client';

import { useState } from 'react';
import { Shield, ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';

const ROLES = [
  { value: 'STUDENT', label: 'Student', desc: 'Can ask doubts, submit answers, bookmark guides' },
  { value: 'HELPER', label: 'Peer Helper', desc: 'Can claim doubts, earn reputation, help peers' },
  { value: 'MODERATOR', label: 'Moderator', desc: 'Can review and moderate answers and resources' },
  { value: 'ADMIN', label: 'Administrator', desc: 'Full platform management and user controls' },
];

export default function AdminRoleSelector({ currentRole, userId, userName, onRoleChanged }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    if (selectedRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update user role.');
        setLoading(false);
        return;
      }

      if (onRoleChanged) onRoleChanged(data.user);
      setIsOpen(false);
    } catch {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSelectedRole(currentRole);
          setError('');
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAF2] bg-white px-2.5 py-1 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] transition-colors"
      >
        <span>{currentRole}</span>
        <ChevronDown size={13} className="text-[#94A3B8]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101B3D]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101B3D]">Change User Role</h3>
                <p className="text-xs text-[#64748B]">Updating role for {userName}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 mb-6">
              {ROLES.map((r) => {
                const isCurrent = r.value === currentRole;
                const isSelected = r.value === selectedRole;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#E5EAF2] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#101B3D]">{r.label}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-[#64748B]">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-[#E5EAF2] px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || selectedRole === currentRole}
                onClick={handleUpdate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

