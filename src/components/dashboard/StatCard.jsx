'use client';

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg = 'bg-[#EFF6FF]',
  iconColor = 'text-[#2563EB]',
}) {
  return (
    <div className="rounded-2xl border border-[#E5EAF2] bg-white p-5 transition-all hover:border-[#BFDBFE] hover:shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-[#101B3D] leading-none mb-1">
        {value}
      </div>
      <div className="text-xs font-semibold text-[#344568] mb-0.5">{label}</div>
      {sub && <div className="text-xs text-[#64748B]">{sub}</div>}
    </div>
  );
}

