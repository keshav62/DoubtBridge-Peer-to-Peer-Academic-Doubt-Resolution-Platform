'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Clock,
  MessageSquare,
  User,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';
import DoubtStatusBadge from '@/components/doubts/DoubtStatusBadge';
import { timeAgo } from '@/lib/utils';

export default function HelperFeedList({
  doubts = [],
  isLoading = false,
  filters = {},
  onFilterChange,
  onClaimDoubt,
  claimingId = null,
  activeCount = 0,
  workloadLimit = 5,
  isAvailable = true,
}) {
  const isAtLimit = activeCount >= workloadLimit;

  return (
    <div className="space-y-5">
      {/* ── Workload & Availability Status Banner ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#E5EAF2] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isAvailable ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isAvailable ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#101B3D]">
                Helper Status: {isAvailable ? 'Accepting Assignments' : 'Availability Paused'}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isAvailable ? 'bg-[#10B981]' : 'bg-amber-500'
                }`}
              />
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Active Workload: <strong className="text-[#101B3D]">{activeCount}</strong> of{' '}
              <strong>{workloadLimit}</strong> allowed assignments
            </p>
          </div>
        </div>

        {/* Workload Progress Bar */}
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-[0.65rem] font-semibold text-[#64748B] mb-1">
            <span>Workload Capacity</span>
            <span>{Math.round((activeCount / workloadLimit) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              style={{ width: `${Math.min((activeCount / workloadLimit) * 100, 100)}%` }}
              className={`h-full rounded-full transition-all ${
                isAtLimit
                  ? 'bg-red-500'
                  : activeCount >= workloadLimit - 1
                  ? 'bg-amber-500'
                  : 'bg-[#2563EB]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── Filters Bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5EAF2] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#344568]">
            <Filter size={13} /> Filters:
          </span>

          {/* Subject Filter */}
          <select
            value={filters.subject || ''}
            onChange={(e) => onFilterChange && onFilterChange('subject', e.target.value)}
            className="rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#101B3D] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Databases">Databases</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="React">React / Web</option>
            <option value="Mathematics">Mathematics</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={filters.urgency || ''}
            onChange={(e) => onFilterChange && onFilterChange('urgency', e.target.value)}
            className="rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#101B3D] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="">All Urgency</option>
            <option value="HIGH">High Urgency</option>
            <option value="MEDIUM">Medium Urgency</option>
            <option value="LOW">Low Urgency</option>
          </select>

          {/* Sort Filter */}
          <select
            value={filters.sort || 'best_match'}
            onChange={(e) => onFilterChange && onFilterChange('sort', e.target.value)}
            className="rounded-xl border border-[#E5EAF2] bg-white px-3 py-1.5 text-xs font-medium text-[#101B3D] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="best_match">Highest Match Score</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="urgency">Highest Urgency</option>
          </select>
        </div>

        <span className="text-xs font-medium text-[#64748B]">
          {doubts.length} {doubts.length === 1 ? 'question' : 'questions'} available to claim
        </span>
      </div>

      {/* ── Feed Doubts List ──────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-[#E5EAF2] bg-white p-5 animate-pulse"
            />
          ))}
        </div>
      ) : doubts.length > 0 ? (
        <div className="space-y-4">
          {doubts.map((doubt) => {
            const isClaiming = claimingId === doubt.id;
            const answersCount = doubt._count?.answers ?? 0;

            return (
              <div
                key={doubt.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#E5EAF2] bg-white p-5 transition-all hover:border-[#BFDBFE] hover:shadow-xs group"
              >
                <div className="min-w-0 flex-1">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <MatchScoreBadge
                      score={doubt.matchScore || 0}
                      reasons={doubt.matchReasons || []}
                    />
                    <DoubtStatusBadge status={doubt.status} />
                    <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
                      {doubt.subject}
                    </span>
                    {doubt.topic && (
                      <span className="text-xs font-medium text-[#475569] bg-slate-100 px-2 py-0.5 rounded-full">
                        {doubt.topic}
                      </span>
                    )}
                    {doubt.urgency === 'HIGH' && (
                      <span className="text-[0.65rem] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        High Urgency
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#101B3D] leading-snug group-hover:text-[#2563EB] transition-colors">
                    <Link href={`/doubts/${doubt.id}`}>{doubt.title}</Link>
                  </h3>

                  {/* Description preview */}
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1">
                    {doubt.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1 text-[#475569]">
                      <User size={12} />
                      {doubt.student?.name || 'Student'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} />
                      {answersCount} {answersCount === 1 ? 'answer' : 'answers'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(doubt.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions column */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9]">
                  <button
                    type="button"
                    disabled={isClaiming || isAtLimit || !isAvailable || !doubt.isEligible}
                    onClick={() => onClaimDoubt && onClaimDoubt(doubt.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                      isAtLimit || !isAvailable || !doubt.isEligible
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                    }`}
                  >
                    {isClaiming ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} />
                        Claim Doubt
                      </>
                    )}
                  </button>

                  <Link
                    href={`/doubts/${doubt.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
                  >
                    Inspect details <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white py-16 text-center px-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <Sparkles size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#101B3D]">No matching open doubts found</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm">
            You've seen all questions matching your current filters, or all open questions in your
            subjects have already been claimed!
          </p>
        </div>
      )}
    </div>
  );
}
