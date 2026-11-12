import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
        <HelpCircle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-[#101B3D]">Page Not Found</h2>
      <p className="mt-2 max-w-sm text-sm text-[#64748B]">
        The academic doubt, page, or resource you are looking for does not exist.
      </p>
      <div className="mt-6">
        <Link
          href="/doubts"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Academic Doubts
        </Link>
      </div>
    </div>
  );
}

