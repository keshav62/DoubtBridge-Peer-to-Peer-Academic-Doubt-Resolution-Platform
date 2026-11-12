'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Plus,
  Flame,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import KnowledgeSearch from '@/components/knowledge/KnowledgeSearch';
import KnowledgeFilters from '@/components/knowledge/KnowledgeFilters';
import KnowledgeList from '@/components/knowledge/KnowledgeList';
import KnowledgeModerationQueue from '@/components/knowledge/KnowledgeModerationQueue';

export default function KnowledgeHubPage() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MINE' | 'BOOKMARKS' | 'MODERATION'
  const [currentUser, setCurrentUser] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [offset, setOffset] = useState(0);
  const limit = 9;

  // Data state
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit, offset: 0, hasMore: false });
  const [featuredResource, setFeaturedResource] = useState(null);
  const [popularResources, setPopularResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user session once
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/helpers/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setCurrentUser(data.user);
        }
      } catch {
        // Fallback default
      }
    }
    loadUser();
  }, []);

  // Fetch knowledge data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (activeTab === 'BOOKMARKS') {
        endpoint = `/api/knowledge/bookmarks?limit=${limit}&offset=${offset}`;
      } else {
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (selectedSubject !== 'All') params.set('subject', selectedSubject);
        if (selectedSort) params.set('sort', selectedSort);
        params.set('limit', String(limit));
        params.set('offset', String(offset));
        if (activeTab === 'MINE') params.set('mine', 'true');

        endpoint = `/api/knowledge?${params.toString()}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load knowledge resources');
      }

      setResources(data.resources || []);
      setPagination(data.pagination || { total: 0, limit, offset: 0, hasMore: false });

      if (data.subjects) {
        setSubjects(data.subjects);
      }

      // Identify top featured and popular articles on initial load of ALL tab
      if (activeTab === 'ALL' && offset === 0 && !searchTerm && selectedSubject === 'All') {
        const sortedByViews = [...data.resources].sort((a, b) => (b.views || 0) - (a.views || 0));
        if (sortedByViews.length > 0) {
          setFeaturedResource(sortedByViews[0]);
          setPopularResources(sortedByViews.slice(1, 4));
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading content');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, selectedSubject, selectedSort, offset]);

  useEffect(() => {
    if (activeTab !== 'MODERATION') {
      fetchData();
    }
  }, [fetchData, activeTab]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('All');
    setSelectedSort('newest');
    setOffset(0);
  };

  const hasActiveFilters = Boolean(
    searchTerm || (selectedSubject && selectedSubject !== 'All') || selectedSort !== 'newest'
  );

  const isModeratorOrAdmin =
    currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');

  return (
    <div className="space-y-8">
      {/* ── Page Hero Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101B3D]">
            Knowledge Hub
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Discover verified peer tutorials, algorithmic breakdowns, and core academic concepts.
          </p>
        </div>

        <Link
          href="/knowledge/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          Submit Article
        </Link>
      </div>

      {/* ── Featured Resource Shelf (Shown on first load of ALL) ──── */}
      {activeTab === 'ALL' && !hasActiveFilters && offset === 0 && featuredResource && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EFF6FF] p-6 sm:p-8 shadow-2xs">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                <Sparkles size={11} /> Featured Guide
              </span>
              <span className="text-xs font-semibold text-[#2563EB]">
                {featuredResource.subject}
              </span>
              {featuredResource.topic && (
                <span className="text-xs text-[#64748B]">• {featuredResource.topic}</span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#101B3D] leading-snug">
              <Link href={`/knowledge/${featuredResource.id}`} className="hover:text-[#2563EB] transition-colors">
                {featuredResource.title}
              </Link>
            </h2>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-2">
              {featuredResource.description || featuredResource.content?.slice(0, 160) + '...'}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#94A3B8] pt-2">
              <span className="font-medium text-[#101B3D]">
                By {featuredResource.author?.name || 'Academic Helper'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={12} className="text-[#2563EB]" />
                {featuredResource.views || 0} reads
              </span>
              <span>•</span>
              <Link
                href={`/knowledge/${featuredResource.id}`}
                className="inline-flex items-center gap-1 font-bold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                Read comprehensive guide <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF2] pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setOffset(0);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'ALL'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          <BookOpen size={14} />
          All Resources
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('MINE');
            setOffset(0);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'MINE'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          <FileText size={14} />
          My Submissions
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('BOOKMARKS');
            setOffset(0);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'BOOKMARKS'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
          }`}
        >
          <Bookmark size={14} />
          Saved Articles
        </button>

        {isModeratorOrAdmin && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('MODERATION');
              setOffset(0);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'MODERATION'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-[#64748B] hover:text-[#101B3D]'
            }`}
          >
            <ShieldCheck size={14} />
            Moderation Queue
          </button>
        )}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────── */}
      {activeTab === 'MODERATION' ? (
        <KnowledgeModerationQueue currentUser={currentUser} />
      ) : (
        <div className="space-y-6">
          {/* Search + Subject Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <KnowledgeSearch
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  setOffset(0);
                }}
                placeholder="Search articles by title, topic, or keyword..."
              />
            </div>

            <KnowledgeFilters
              subjects={subjects}
              selectedSubject={selectedSubject}
              onSelectSubject={(subj) => {
                setSelectedSubject(subj);
                setOffset(0);
              }}
              selectedSort={selectedSort}
              onSelectSort={(sort) => {
                setSelectedSort(sort);
                setOffset(0);
              }}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* List of articles */}
          <KnowledgeList
            resources={resources}
            isLoading={isLoading}
            error={error}
            onRetry={fetchData}
            pagination={pagination}
            onPageChange={(newOffset) => setOffset(newOffset)}
            emptyTitle={
              activeTab === 'BOOKMARKS'
                ? 'No saved articles yet'
                : activeTab === 'MINE'
                ? 'You have not submitted any articles'
                : 'No articles match your criteria'
            }
            emptyDescription={
              activeTab === 'BOOKMARKS'
                ? 'Click the bookmark icon on any article card to save it for quick reference later.'
                : activeTab === 'MINE'
                ? 'Contribute your own academic notes or guides to help peers across the platform.'
                : 'Try adjusting your search terms or selecting a different academic discipline.'
            }
            onBookmarkChange={(resourceId, isBookmarked) => {
              // Optimistically update list if in bookmarks tab
              if (activeTab === 'BOOKMARKS' && !isBookmarked) {
                setResources((prev) => prev.filter((r) => r.id !== resourceId));
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
