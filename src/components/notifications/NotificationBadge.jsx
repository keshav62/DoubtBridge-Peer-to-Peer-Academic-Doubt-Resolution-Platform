'use client';

export default function NotificationBadge({ count = 0, className = '' }) {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[0.62rem] font-extrabold leading-none text-white shadow-xs ${className}`}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
}

