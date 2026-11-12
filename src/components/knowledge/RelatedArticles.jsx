'use client';

import Link from 'next/link';
import { BookOpen, Eye, ArrowRight } from 'lucide-react';

export default function RelatedArticles({ related = [], currentSubject = '' }) {
  if (!related || related.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#101B3D] flex items-center gap-2">
          <BookOpen size={16} className="text-[#2563EB]" />
          Related Articles
        </h3>
        {currentSubject && (
          <span className="text-[0.65rem] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
            {currentSubject}
          </span>
        )}
      </div>

      <div className="divide-y divide-[#F1F5F9]">
        {related.map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 group">
            <Link href={`/knowledge/${item.id}`} className="block">
              <h4 className="text-xs font-bold text-[#101B3D] group-hover:text-[#2563EB] transition-colors leading-snug">
                {item.title}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-[0.65rem] text-[#94A3B8]">
                <span>{item.author?.name || 'Academic Helper'}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Eye size={10} />
                  {item.views || 0}
                </span>
                {item.topic && (
                  <>
                    <span>•</span>
                    <span className="text-[#2563EB]">{item.topic}</span>
                  </>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-center">
        <Link
          href={`/knowledge?subject=${encodeURIComponent(currentSubject)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          Explore more in {currentSubject || 'this subject'} <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

