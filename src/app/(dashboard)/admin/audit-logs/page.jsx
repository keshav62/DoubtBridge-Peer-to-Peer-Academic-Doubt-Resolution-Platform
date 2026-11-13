'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import AdminAuditLogTable from '@/components/admin/AdminAuditLogTable';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (action) params.set('action', action);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [action, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-[#101B3D]">
              Administrative Audit Logs
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#64748B]">
              {pagination.total} Records
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Append-only chronological record of role modifications, account suspensions, and report resolutions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh Audit Logs
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5EAF2]">
        {[
          { key: '', label: 'All Operations' },
          { key: 'USER_ROLE_CHANGE', label: 'Role Changes' },
          { key: 'USER_SUSPEND', label: 'Account Suspensions' },
          { key: 'USER_ACTIVATE', label: 'Account Activations' },
          { key: 'REPORT_REVIEW', label: 'Report Reviews' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setAction(tab.key);
              setPage(1);
            }}
            className={`border-b-2 px-4 pb-3 text-xs font-bold transition-all ${
              action === tab.key
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <AdminAuditLogTable logs={logs} loading={loading} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E5EAF2] pt-4">
          <p className="text-xs text-[#64748B]">
            Showing Page <span className="font-bold text-[#101B3D]">{pagination.page}</span> of{' '}
            <span className="font-bold text-[#101B3D]">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-semibold text-[#101B3D] hover:bg-[#F8FAFC] disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

