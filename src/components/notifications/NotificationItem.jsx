'use client';

import { useRouter } from 'next/navigation';
import {
  MessageSquareQuote,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  Bell,
  Trash2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  compact = false,
  onItemClick,
}) {
  const router = useRouter();

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'ANSWER_SUBMITTED':
        return <MessageSquareQuote size={16} className="text-[#2563EB]" />;
      case 'DOUBT_RESOLVED':
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case 'MODERATION_DECISION':
        return <ShieldCheck size={16} className="text-purple-600" />;
      case 'DOUBT_CREATED':
        return <HelpCircle size={16} className="text-amber-600" />;
      case 'SYSTEM':
      default:
        return <Bell size={16} className="text-[#64748B]" />;
    }
  };

  const getIconBg = () => {
    switch (notification.type) {
      case 'ANSWER_SUBMITTED':
        return 'bg-blue-50 border-blue-100';
      case 'DOUBT_RESOLVED':
        return 'bg-emerald-50 border-emerald-100';
      case 'MODERATION_DECISION':
        return 'bg-purple-50 border-purple-100';
      case 'DOUBT_CREATED':
        return 'bg-amber-50 border-amber-100';
      case 'SYSTEM':
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const handleClick = async (e) => {
    // If clicking action buttons, do not navigate
    if (e.target.closest('button.action-btn')) {
      return;
    }

    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }

    if (onItemClick) {
      onItemClick(notification);
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
      className={`group relative flex items-start gap-3 border-b border-[#F1F5F9] transition-all last:border-b-0 cursor-pointer ${
        notification.isRead
          ? 'bg-white hover:bg-[#F8FAFC]'
          : 'bg-[#EFF6FF]/40 hover:bg-[#EFF6FF]/70'
      } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
    >
      {/* Icon badge */}
      <div
        className={`flex flex-shrink-0 items-center justify-center rounded-xl border ${getIconBg()} ${
          compact ? 'h-8 w-8' : 'h-10 w-10'
        }`}
      >
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h4
            className={`text-xs sm:text-sm leading-snug truncate ${
              notification.isRead ? 'font-semibold text-[#101B3D]' : 'font-bold text-[#101B3D]'
            }`}
          >
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full bg-[#2563EB]"
              title="Unread notification"
            />
          )}
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        <div className="mt-1.5 flex items-center gap-2 text-[0.68rem] text-[#94A3B8]">
          <span>{timeAgo(notification.createdAt)}</span>
          {notification.link && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5 text-[#2563EB] font-medium">
                View details <ExternalLink size={10} />
              </span>
            </>
          )}
        </div>
      </div>

      {/* Floating actions (visible on hover) */}
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && onMarkRead && (
          <button
            type="button"
            title="Mark as read"
            aria-label="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="action-btn flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5EAF2] bg-white text-[#64748B] shadow-2xs hover:border-[#BFDBFE] hover:text-[#2563EB] transition-colors"
          >
            <Check size={13} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            title="Delete notification"
            aria-label="Delete notification"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="action-btn flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5EAF2] bg-white text-[#64748B] shadow-2xs hover:border-red-200 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
