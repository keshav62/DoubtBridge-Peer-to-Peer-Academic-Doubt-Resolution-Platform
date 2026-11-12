'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function KnowledgeSearch({ value = '', onChange, placeholder = 'Search articles, topics, concepts...' }) {
  const [term, setTerm] = useState(value);
  const isFirstRender = useRef(true);

  // Sync internal state when parent resets or updates value
  useEffect(() => {
    setTerm(value);
  }, [value]);

  // 350ms debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onChange(term);
    }, 350);

    return () => clearTimeout(timer);
  }, [term, onChange]);

  const handleClear = () => {
    setTerm('');
    onChange('');
  };

  return (
    <div className="relative flex-1 min-w-[240px] max-w-md">
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
      />
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#E5EAF2] bg-white pl-9 pr-9 text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
      />
      {term && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#101B3D] transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

