'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, BookOpen } from 'lucide-react';
import KnowledgeArticleDetail from '@/components/knowledge/KnowledgeArticleDetail';

export default function KnowledgeArticlePage() {
  const params = useParams();
  const articleId = params?.articleId;

  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/helpers/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setCurrentUser(data.user);
        }
      } catch {
        // Fallback
      }
    }
    loadUser();
  }, []);

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/${articleId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load article');
      }

      setResource(data.resource);
      setRelated(data.related || []);
    } catch (err) {
      setError(err.message || 'Article not found or inaccessible');
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-100 rounded" />
        <div className="rounded-2xl border border-[#E5EAF2] bg-white p-8 space-y-4">
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
            <div className="h-5 w-24 bg-slate-100 rounded-full" />
          </div>
          <div className="h-8 w-3/4 bg-slate-100 rounded" />
          <div className="h-4 w-1/2 bg-slate-100 rounded" />
          <div className="space-y-3 pt-6">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-md mx-auto my-12 rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-base font-bold text-red-900">Article Unavailable</h2>
        <p className="text-xs text-red-700 leading-relaxed">
          {error || 'This academic resource could not be found or has not yet been approved.'}
        </p>
        <div className="pt-2">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8]"
          >
            <ArrowLeft size={14} /> Back to Knowledge Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <KnowledgeArticleDetail
      resource={resource}
      related={related}
      currentUser={currentUser}
    />
  );
}

