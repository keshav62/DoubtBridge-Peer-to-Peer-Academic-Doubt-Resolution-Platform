'use client';

import { Activity, Shield, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

function getActionBadge(action) {
  switch (action) {
    case 'USER_ROLE_CHANGE':
      return {
        label: 'Role Change',
        cls: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Shield,
      };
    case 'USER_SUSPEND':
      return {
        label: 'Account Suspended',
        cls: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertTriangle,
      };
    case 'USER_ACTIVATE':
      return {
        label: 'Account Activated',
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    case 'REPORT_REVIEW':
      return {
        label: 'Report Reviewed',
        cls: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: FileText,
      };
    default:
      return {
        label: action,
        cls: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: Activity,
      };
  }
}

export default function AdminAuditLogTable({ logs, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 w-full rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white p-12 text-center">
        <Activity size={24} className="text-[#94A3B8] mb-2" />
        <p className="text-sm font-bold text-[#101B3D]">No audit records recorded yet</p>
        <p className="text-xs text-[#64748B] mt-1">Administrative actions will automatically generate append-only logs here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5EAF2] bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E5EAF2] bg-[#F8FAFC]">
            <th className="py-3.5 pl-5 pr-3 font-semibold text-[#64748B] uppercase tracking-wider">Timestamp</th>
            <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Administrator</th>
            <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Action</th>
            <th className="px-3 py-3.5 font-semibold text-[#64748B] uppercase tracking-wider">Target</th>
            <th className="py-3.5 pl-3 pr-5 font-semibold text-[#64748B] uppercase tracking-wider">Audit Metadata</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAF2]">
          {logs.map((log) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;
            let metaObj = null;
            try {
              if (log.metadata) metaObj = JSON.parse(log.metadata);
            } catch {
              metaObj = { note: log.metadata };
            }

            return (
              <tr key={log.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                {/* Timestamp */}
                <td className="py-3.5 pl-5 pr-3 whitespace-nowrap text-[#64748B]">
                  <span className="font-medium text-[#101B3D]">{timeAgo(log.createdAt)}</span>
                  <span className="block text-[0.65rem] text-[#94A3B8]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </td>

                {/* Actor */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[#2563EB] text-[0.6rem] font-bold">
                      {log.actor?.name?.slice(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div>
                      <span className="font-semibold text-[#101B3D] block">{log.actor?.name || 'Admin'}</span>
                      <span className="text-[0.65rem] text-[#64748B]">{log.actor?.email}</span>
                    </div>
                  </div>
                </td>

                {/* Action Badge */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badge.cls}`}
                  >
                    <Icon size={12} />
                    {badge.label}
                  </span>
                </td>

                {/* Target */}
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <span className="font-mono text-[0.7rem] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {log.targetType}:{log.targetId.slice(0, 12)}...
                  </span>
                </td>

                {/* Metadata */}
                <td className="py-3.5 pl-3 pr-5 text-[#344568]">
                  {metaObj ? (
                    <div className="space-y-0.5 font-mono text-[0.7rem]">
                      {Object.entries(metaObj).map(([k, v]) => (
                        <div key={k} className="truncate max-w-xs">
                          <span className="text-[#94A3B8]">{k}:</span>{' '}
                          <span className="text-[#101B3D] font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#94A3B8]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
