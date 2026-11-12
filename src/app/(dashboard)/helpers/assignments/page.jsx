'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import HelperAssignmentsList from '@/components/helpers/HelperAssignmentsList';

export default function HelperAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isProcessingId, setIsProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/helpers/assignments');
      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCancelAssignment = async (assignmentId) => {
    try {
      setIsProcessingId(assignmentId);
      const res = await fetch(`/api/helpers/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to cancel assignment');
      await fetchAssignments();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/helpers"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
            >
              <ArrowLeft size={13} /> Back to Helper Hub
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101B3D]">
            My Doubt Assignments
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your claimed academic doubts and track your resolution progress.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAssignments}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-bold text-[#101B3D] hover:bg-[#F8FAFC] shadow-xs self-start sm:self-auto"
        >
          <RefreshCw size={13} className="text-[#64748B]" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Assignments List ──────────────────────────────────── */}
      <HelperAssignmentsList
        assignments={assignments}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onCancelAssignment={handleCancelAssignment}
        isProcessingId={isProcessingId}
      />
    </div>
  );
}
