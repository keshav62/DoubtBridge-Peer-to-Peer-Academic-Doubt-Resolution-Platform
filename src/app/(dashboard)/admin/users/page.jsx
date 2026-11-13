'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, ChevronLeft, ChevronRight, Shield, AlertCircle } from 'lucide-react';
import AdminUserFilters from '@/components/admin/AdminUserFilters';
import AdminUserTable from '@/components/admin/AdminUserTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Fetch current user identity once
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCurrentAdmin(d.user);
      })
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      if (sort) params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setUsers(json.users || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, sort, page]);

  // Debounced search / filter reload
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleResetFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setSort('newest');
    setPage(1);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-[#101B3D]">
              User Directory &amp; Governance
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#64748B]">
              {pagination.total} Total
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Search registered students, peer helpers, moderators, and manage account statuses.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold text-[#2563EB] hover:underline"
        >
          <ChevronLeft size={14} /> Back to Control Center
        </Link>
      </div>

      {/* Filters Toolbar */}
      <AdminUserFilters
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        role={role}
        setRole={(val) => {
          setRole(val);
          setPage(1);
        }}
        status={status}
        setStatus={(val) => {
          setStatus(val);
          setPage(1);
        }}
        sort={sort}
        setSort={(val) => {
          setSort(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Users Table */}
      <AdminUserTable
        users={users}
        loading={loading}
        onUserUpdated={handleUserUpdated}
        currentAdminId={currentAdmin?.id}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E5EAF2] pt-4">
          <p className="text-xs text-[#64748B]">
            Showing Page <span className="font-bold text-[#101B3D]">{pagination.page}</span> of{' '}
            <span className="font-bold text-[#101B3D]">{pagination.totalPages}</span> ({pagination.total} users)
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

