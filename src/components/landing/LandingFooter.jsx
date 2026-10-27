import Link from 'next/link';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#E5EAF2] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex items-end gap-1 h-7">
                <span className="w-2.5 h-5 rounded-full bg-[#2563EB]" />
                <span className="w-2.5 h-7 rounded-full bg-[#06B6D4]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-[#101B3D] tracking-tight leading-none">
                  DoubtBridge
                </span>
                <span className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase mt-0.5">
                  Learn · Ask · Solve
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#64748B] leading-relaxed max-w-sm">
              A peer-to-peer academic doubt resolution platform connecting students with verified peer helpers and curated study guides.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold text-[#101B3D] uppercase tracking-wider">
              Navigation
            </p>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li>
                <a href="#features" className="hover:text-[#2563EB] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/helpers" className="hover:text-[#2563EB] transition-colors">
                  Peer Mentors
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="hover:text-[#2563EB] transition-colors">
                  Knowledge Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Account / Action Links */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold text-[#101B3D] uppercase tracking-wider">
              Get Started
            </p>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li>
                <Link href="/login" className="hover:text-[#2563EB] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#2563EB] transition-colors">
                  Create an Account
                </Link>
              </li>
              <li>
                <Link href="/doubts/new" className="hover:text-[#2563EB] transition-colors">
                  Ask a Doubt
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
                  Open Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-[#E5EAF2] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {currentYear} DoubtBridge. All rights reserved.</p>
          <p>Built for peer-to-peer student collaboration.</p>
        </div>
      </div>
    </footer>
  );
}
