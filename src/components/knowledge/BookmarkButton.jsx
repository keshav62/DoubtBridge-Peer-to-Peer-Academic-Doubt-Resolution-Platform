'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';

export default function BookmarkButton({
  resourceId,
  initialBookmarked = false,
  initialCount = 0,
  showCount = true,
  size = 'sm',
  className = '',
  onToggle,
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading || !resourceId) return;

    // Optimistic toggle
    const previousState = isBookmarked;
    const previousCount = count;
    setIsBookmarked(!previousState);
    setCount(previousState ? Math.max(0, count - 1) : count + 1);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/knowledge/${resourceId}/bookmark`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on error
        setIsBookmarked(previousState);
        setCount(previousCount);
      } else {
        setIsBookmarked(data.bookmarked);
        if (onToggle) onToggle(data.bookmarked);
      }
    } catch {
      // Rollback on network failure
      setIsBookmarked(previousState);
      setCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
      title={isBookmarked ? 'Saved to bookmarks' : 'Save to bookmarks'}
      className={`inline-flex items-center gap-1.5 rounded-xl border transition-all ${
        isBookmarked
          ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB] shadow-2xs font-semibold'
          : 'border-[#E5EAF2] bg-white text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB]'
      } ${
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'
      } ${className}`}
    >
      <Bookmark
        size={isSmall ? 13 : 16}
        className={isBookmarked ? 'fill-[#2563EB] text-[#2563EB]' : 'text-[#64748B]'}
      />
      {showCount && <span className="tabular-nums">{count}</span>}
    </button>
  );
}

