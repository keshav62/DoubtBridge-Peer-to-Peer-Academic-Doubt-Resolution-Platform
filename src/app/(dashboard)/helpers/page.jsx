'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  CheckCircle,
  Award,
  Users,
  BookOpen,
  Filter,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import HelperFeedList from '@/components/helpers/HelperFeedList';
import HelperAssignmentsList from '@/components/helpers/HelperAssignmentsList';
import HelperProfileCard from '@/components/helpers/HelperProfileCard';
import HelperProfileForm from '@/components/helpers/HelperProfileForm';
import HelperCard from '@/components/helpers/HelperCard';

export default function HelpersHubPage() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'assignments' | 'profile' | 'directory'
  const [profileData, setProfileData] = useState(null);
  const [feedDoubts, setFeedDoubts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [directoryHelpers, setDirectoryHelpers] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const [feedFilters, setFeedFilters] = useState({
    subject: '',
    topic: '',
    urgency: '',
    difficulty: '',
    sort: 'best_match',
  });

  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [claimingId, setClaimingId] = useState(null);
  const [isProcessingAssignmentId, setIsProcessingAssignmentId] = useState(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Fetch Helper Profile & Stats
  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch('/api/helpers/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
      }
    } catch (err) {
      console.error('Error fetching helper profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // 2. Fetch Matched Feed Doubts
  const fetchFeed = useCallback(async () => {
    try {
      setLoadingFeed(true);
      const params = new URLSearchParams();
      if (feedFilters.subject) params.set('subject', feedFilters.subject);
      if (feedFilters.topic) params.set('topic', feedFilters.topic);
      if (feedFilters.urgency) params.set('urgency', feedFilters.urgency);
      if (feedFilters.difficulty) params.set('difficulty', feedFilters.difficulty);
      if (feedFilters.sort) params.set('sort', feedFilters.sort);

      const res = await fetch(`/api/helpers/feed?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load recommended feed');
      const data = await res.json();
      if (data.success) {
        setFeedDoubts(data.doubts || []);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoadingFeed(false);
    }
  }, [feedFilters]);

  // 3. Fetch Helper Assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const res = await fetch('/api/helpers/assignments');
      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  // 4. Fetch Helpers Directory
  const fetchDirectory = useCallback(async () => {
    try {
      setLoadingDirectory(true);
      const res = await fetch('/api/helpers');
      if (!res.ok) throw new Error('Failed to load helper directory');
      const data = await res.json();
      if (data.success) {
        setDirectoryHelpers(data.helpers || []);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoadingDirectory(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchFeed();
  }, [fetchProfile, fetchFeed]);

  // Lazy load tab data
  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    } else if (activeTab === 'directory') {
      fetchDirectory();
    }
  }, [activeTab, fetchAssignments, fetchDirectory]);

  // Handle Doubt Claim
  const handleClaimDoubt = async (doubtId) => {
    try {
      setClaimingId(doubtId);
      setErrorMessage(null);
      setBannerMessage(null);

      const res = await fetch(`/api/doubts/${doubtId}/claim`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to claim doubt');
      }

      setBannerMessage('Doubt claimed successfully! It has been added to your Active Assignments.');
      // Refresh feed, profile and assignments
      await Promise.all([fetchFeed(), fetchProfile(), fetchAssignments()]);
      setTimeout(() => setBannerMessage(null), 6000);
    } catch (err) {
      setErrorMessage(err.message);
      // Refresh feed in case someone else claimed it
      fetchFeed();
    } finally {
      setClaimingId(null);
    }
  };

  // Handle Availability Toggle
  const handleToggleAvailability = async () => {
    try {
      setIsTogglingAvailability(true);
      const res = await fetch('/api/helpers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_availability' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to toggle availability');
      await Promise.all([fetchProfile(), fetchFeed()]);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (updatedData) => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/helpers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save profile');

      setBannerMessage('Helper profile and academic expertise updated successfully!');
      await Promise.all([fetchProfile(), fetchFeed()]);
      setTimeout(() => setBannerMessage(null), 5000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Assignment Cancellation / Release
  const handleCancelAssignment = async (assignmentId) => {
    try {
      setIsProcessingAssignmentId(assignmentId);
      const res = await fetch(`/api/helpers/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to cancel assignment');

      setBannerMessage('Assignment released. The doubt has been reopened for the community.');
      await Promise.all([fetchAssignments(), fetchProfile(), fetchFeed()]);
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessingAssignmentId(null);
    }
  };

  const stats = profileData?.stats || {};
  const isAvailable = profileData?.isAvailable !== false;
  const user = profileData?.user || {};

  return (
    <div className="space-y-7 pb-12">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B3D]">
              Peer Helper Service
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              <Sparkles size={11} />
              {user.role || 'HELPER'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Discover matching academic doubts, claim questions in your expertise, and earn reputation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!profileData?.hasProfile ? (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-all"
            >
              <Sparkles size={14} />
              Activate Helper Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2 text-xs font-bold text-[#101B3D] hover:bg-[#F8FAFC] shadow-xs"
            >
              Update Expertise
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              fetchProfile();
              if (activeTab === 'feed') fetchFeed();
              if (activeTab === 'assignments') fetchAssignments();
              if (activeTab === 'directory') fetchDirectory();
            }}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-[#E5EAF2] bg-white text-[#64748B] hover:text-[#101B3D] hover:bg-[#F8FAFC] shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Notifications / Alerts ───────────────────────────── */}
      {bannerMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-[#ECFDF5] p-4 text-xs font-semibold text-emerald-800 shadow-xs">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="font-bold underline ml-4 hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Quick Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Active Workload</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#101B3D]">
            {stats.activeAssignmentsCount ?? 0} / {stats.workloadLimit ?? 5}
          </div>
          <p className="text-[0.7rem] text-[#64748B] mt-1">Claimed doubts in progress</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Recommended Doubts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#101B3D]">{feedDoubts.length}</div>
          <p className="text-[0.7rem] text-[#64748B] mt-1">Matching your expertise</p>
        </div>

        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Accepted Solutions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981]">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#101B3D]">{stats.acceptedAnswers ?? 0}</div>
          <p className="text-[0.7rem] text-[#64748B] mt-1">
            Out of {stats.totalAnswers ?? 0} contributed
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B]">Peer Reputation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDE9FE] text-violet-600">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#101B3D]">{stats.reputation ?? 0}</div>
          <p className="text-[0.7rem] text-[#64748B] mt-1">+25 per accepted solution</p>
        </div>
      </div>

      {/* ── Main Tab Navigation ──────────────────────────────── */}
      <div className="flex border-b border-[#E5EAF2] overflow-x-auto no-scrollbar gap-2">
        {[
          { key: 'feed', label: 'Matched Open Doubts', count: feedDoubts.length },
          { key: 'assignments', label: 'My Assignments', count: stats.activeAssignmentsCount },
          { key: 'profile', label: 'Helper Profile & Availability' },
          { key: 'directory', label: 'Peer Helpers Directory' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                  activeTab === tab.key
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Matched Feed Doubts ───────────────────────── */}
      {activeTab === 'feed' && (
        <HelperFeedList
          doubts={feedDoubts}
          isLoading={loadingFeed}
          filters={feedFilters}
          onFilterChange={(key, val) => setFeedFilters((prev) => ({ ...prev, [key]: val }))}
          onClaimDoubt={handleClaimDoubt}
          claimingId={claimingId}
          activeCount={stats.activeAssignmentsCount || 0}
          workloadLimit={stats.workloadLimit || 5}
          isAvailable={isAvailable}
        />
      )}

      {/* ── Tab 2: My Assignments ────────────────────────────── */}
      {activeTab === 'assignments' && (
        <HelperAssignmentsList
          assignments={assignments}
          isLoading={loadingAssignments}
          statusFilter={assignmentFilter}
          onStatusFilterChange={setAssignmentFilter}
          onCancelAssignment={handleCancelAssignment}
          isProcessingId={isProcessingAssignmentId}
        />
      )}

      {/* ── Tab 3: Helper Profile ────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <HelperProfileCard
            profileData={profileData || {}}
            onToggleAvailability={handleToggleAvailability}
            isToggling={isTogglingAvailability}
            onOpenEdit={() => setIsProfileModalOpen(true)}
          />
        </div>
      )}

      {/* ── Tab 4: Peer Directory ────────────────────────────── */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#64748B]">
              Browse verified student helpers and academic mentors in DoubtBridge.
            </p>
          </div>

          {loadingDirectory ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-[#E5EAF2] bg-white p-6 animate-pulse"
                />
              ))}
            </div>
          ) : directoryHelpers.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {directoryHelpers.map((helper) => (
                <HelperCard
                  key={helper.id}
                  helper={helper}
                  onRequestHelp={() => {
                    setActiveTab('feed');
                    setFeedFilters((prev) => ({
                      ...prev,
                      subject: helper.subjects?.split(',')[0] || '',
                    }));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-xs text-[#64748B]">
              No peer helpers found.
            </div>
          )}
        </div>
      )}

      {/* ── Profile Edit Modal ───────────────────────────────── */}
      <HelperProfileForm
        isOpen={isProfileModalOpen}
        initialData={{
          hasProfile: profileData?.hasProfile,
          bio: profileData?.bio,
          subjects: profileData?.subjects,
          expertise: profileData?.expertise,
          isAvailable: profileData?.isAvailable,
        }}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
}
