'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Star, ChevronLeft, ChevronRight, Loader2, AlertCircle, Crown } from 'lucide-react';

const ROLE_COLORS = {
  STUDENT: 'text-[#2563EB] bg-[#EFF6FF]',
  HELPER: 'text-[#059669] bg-[#ECFDF5]',
  MODERATOR: 'text-[#7C3AED] bg-[#F5F3FF]',
  ADMIN: 'text-[#DC2626] bg-[#FEF2F2]',
};

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#B45309']; // gold, silver, bronze

function PodiumCard({ entry, podiumRank }) {
  const isFirst = podiumRank === 1;
  const color = RANK_COLORS[podiumRank - 1] || '#94A3B8';
  const roleCls = ROLE_COLORS[entry.role] || 'text-[#64748B] bg-[#F1F5F9]';
  const initials = entry.name ? entry.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <div className={`flex flex-col items-center gap-2 ${isFirst ? 'order-first md:order-none' : ''}`}>
      {isFirst && <Crown size={20} style={{ color }} className="mb-1" />}

      {/* Avatar */}
      <div
        className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-lg border-4"
        style={{
          background: `linear-gradient(135deg, ${color}CC, ${color}66)`,
          borderColor: color,
        }}
      >
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.name} className="h-full w-full rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Podium badge */}
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow"
        style={{ backgroundColor: color }}
      >
        {podiumRank}
      </div>

      <div className="text-center">
        <p className="font-bold text-sm text-[#101B3D] max-w-[100px] truncate">{entry.name}</p>
        <span className={`text-[9px] font-bold uppercase rounded-full px-1.5 py-0.5 ${roleCls}`}>{entry.role}</span>
        <p className="text-xs font-semibold text-[#2563EB] mt-1">{entry.reputation} pts</p>
        {entry.acceptedAnswers > 0 && (
          <p className="text-[10px] text-[#64748B]">{entry.acceptedAnswers} accepted</p>
        )}
      </div>
    </div>
  );
}

function RankRow({ entry, isCurrent }) {
  const roleCls = ROLE_COLORS[entry.role] || 'text-[#64748B] bg-[#F1F5F9]';
  const initials = entry.name ? entry.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '??';
  const rankColor = entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : undefined;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrent ? 'bg-[#EFF6FF] border-2 border-[#2563EB]' : 'hover:bg-[#F8FAFC]'}`}>
      {/* Rank */}
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black"
        style={rankColor ? { backgroundColor: rankColor, color: '#fff' } : { backgroundColor: '#F1F5F9', color: '#344568' }}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}
      >
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.name} className="h-full w-full rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-[#101B3D] truncate">{entry.name}</p>
          {isCurrent && <span className="text-[9px] font-bold text-[#2563EB] bg-[#DBEAFE] rounded-full px-1.5 py-0.5">YOU</span>}
          <span className={`text-[9px] font-bold uppercase rounded-full px-1.5 py-0.5 ${roleCls}`}>{entry.role}</span>
        </div>
        {(entry.department || entry.academicYear) && (
          <p className="text-[10px] text-[#94A3B8]">{[entry.department, entry.academicYear].filter(Boolean).join(' · ')}</p>
        )}
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-[#101B3D]">{entry.reputation} <span className="text-[10px] font-normal text-[#94A3B8]">pts</span></p>
        {entry.acceptedAnswers > 0 && (
          <p className="text-[10px] text-[#64748B]">{entry.acceptedAnswers} accepted</p>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async (currentPeriod, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({ period: currentPeriod, page: String(currentPage), limit: '20' });
      const res = await fetch(`/api/leaderboard?${sp}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period, page); }, [load, period, page]);

  const handlePeriodChange = (p) => { setPeriod(p); setPage(1); };

  const periods = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'week', label: 'This Week' },
  ];

  const leaderboard = data?.leaderboard || [];
  const currentUserRank = data?.currentUserRank;
  const pagination = data?.pagination || {};

  // Top 3 for podium (only on page 1)
  const top3 = page === 1 ? leaderboard.slice(0, 3) : [];
  const rest = page === 1 ? leaderboard.slice(3) : leaderboard;

  // Reorder podium: 2nd, 1st, 3rd
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] :
                      top3.length === 2 ? [top3[1], top3[0]] :
                      top3;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#101B3D] flex items-center gap-2">
          <Trophy size={22} className="text-[#F59E0B]" /> Leaderboard
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">Top contributors ranked by reputation and accepted answers.</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#F1F5F9] self-start w-fit">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePeriodChange(p.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${period === p.key ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#101B3D]'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Current user rank card (if not on page 1 or not visible) */}
      {currentUserRank && !leaderboard.find((e) => e.isCurrentUser) && (
        <div className="rounded-xl border-2 border-[#2563EB] bg-[#EFF6FF] p-4">
          <p className="text-xs font-bold text-[#2563EB] mb-2 uppercase tracking-wide">Your Rank</p>
          <RankRow entry={currentUserRank} isCurrent />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
          <Loader2 size={24} className="animate-spin text-[#F59E0B]" />
          <span className="text-sm">Loading leaderboard…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-sm text-[#64748B]">{error}</p>
          <button onClick={() => load(period, page)} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">Retry</button>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Trophy size={40} className="text-[#CBD5E1]" />
          <p className="font-semibold text-[#101B3D]">No data yet for this period</p>
          <p className="text-sm text-[#64748B]">Start answering doubts to climb the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Podium — only on first page with 2+ entries */}
          {page === 1 && top3.length >= 2 && (
            <div className="rounded-xl border border-[#E5EAF2] bg-gradient-to-b from-[#FFFBEB] to-white p-6 shadow-sm">
              <div className="flex items-end justify-center gap-6 md:gap-10">
                {podiumOrder.map((entry) => (
                  <PodiumCard key={entry.id} entry={entry} podiumRank={entry.rank} />
                ))}
              </div>
            </div>
          )}

          {/* Full ranked list */}
          <div className="rounded-xl border border-[#E5EAF2] bg-white shadow-sm divide-y divide-[#F1F5F9] overflow-hidden">
            {(page === 1 ? rest : leaderboard).map((entry) => (
              <RankRow key={entry.id} entry={entry} isCurrent={entry.isCurrentUser} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-xl border border-[#E5EAF2] px-3 py-1.5 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-[#64748B] font-medium">Page {page} of {pagination.totalPages}</span>
              <button
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-xl border border-[#E5EAF2] px-3 py-1.5 text-xs font-semibold text-[#344568] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
