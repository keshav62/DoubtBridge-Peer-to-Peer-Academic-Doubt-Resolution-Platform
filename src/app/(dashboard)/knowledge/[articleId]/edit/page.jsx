'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import KnowledgeArticleForm from '@/components/knowledge/KnowledgeArticleForm';

export default function EditKnowledgeArticlePage() {
  const params = useParams();
  const articleId = params?.articleId;

  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticle() {
      if (!articleId) return;
      try {
        const res = await fetch(`/api/knowledge/${articleId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load article for editing');
        }
        setResource(data.resource);
      } catch (err) {
        setError(err.message || 'Article not found');
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [articleId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-32 w-full bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-md mx-auto my-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <AlertCircle size={24} className="mx-auto text-red-600" />
        <h2 className="text-sm font-bold text-red-900">Cannot Edit Resource</h2>
        <p className="text-xs text-red-700">{error}</p>
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
        >
          <ArrowLeft size={13} /> Back to Knowledge Hub
        </Link>
      </div>
    );
  }

  return <KnowledgeArticleForm initialData={resource} isEdit={true} />;
}
