"use client";

import React, { useState, useRef, useEffect } from "react";
import { Meeting } from "@/types/meeting";
import { formatMeetingTime, formatMeetingDate } from "@/lib/utils";
import {
  Video,
  MessageSquare,
  MoreHorizontal,
  Play,
  Copy,
  Edit3,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface MeetingCardProps {
  meeting: Meeting;
  currentUserId?: string;
  onCopyInvitation?: (meeting: Meeting) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  onCopySuccess?: (msg: string) => void;
  className?: string;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentUserId,
  onCopyInvitation,
  onEditMeeting,
  onDeleteMeeting,
  onCopySuccess,
  className,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHost = currentUserId === meeting.host_id;
  const isEnded = meeting.status?.toLowerCase() === "ended";
  const isActive = meeting.status?.toLowerCase() === "active";
  const meetingTopic = meeting.topic || meeting.title || "Zoom Meeting";
  const hostName = meeting.host?.display_name || "Host";

  // Check if currTime < meeting's start time (future meeting)
  const isFutureMeeting = meeting.scheduled_start_time
    ? new Date(meeting.scheduled_start_time).getTime() > Date.now()
    : false;

  // Calculate relative date label: Today, Tomorrow, Yesterday, or Month Date
  const getRelativeDateLabel = () => {
    if (!meeting.scheduled_start_time) return "Today";
    const mDate = new Date(meeting.scheduled_start_time);
    const now = new Date();

    const isToday =
      mDate.getFullYear() === now.getFullYear() &&
      mDate.getMonth() === now.getMonth() &&
      mDate.getDate() === now.getDate();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
      mDate.getFullYear() === tomorrow.getFullYear() &&
      mDate.getMonth() === tomorrow.getMonth() &&
      mDate.getDate() === tomorrow.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      mDate.getFullYear() === yesterday.getFullYear() &&
      mDate.getMonth() === yesterday.getMonth() &&
      mDate.getDate() === yesterday.getDate();

    const monthStr = mDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (isToday) return `Today, ${monthStr}`;
    if (isTomorrow) return `Tomorrow, ${monthStr}`;
    if (isYesterday) return `Yesterday, ${monthStr}`;
    return monthStr;
  };

  // Time range string: 04:12 - 04:48
  const getTimeRangeStr = () => {
    const startD = meeting.scheduled_start_time
      ? new Date(meeting.scheduled_start_time)
      : new Date();
    const endD = meeting.scheduled_end_time
      ? new Date(meeting.scheduled_end_time)
      : new Date(startD.getTime() + (meeting.duration_minutes || 30) * 60000);

    return `${formatMeetingTime(startD.toISOString())} - ${formatMeetingTime(endD.toISOString())}`;
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleStartJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/meeting/${meeting.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/chat?meetingId=${meeting.id}`);
  };

  const handleCopyInviteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onCopyInvitation) {
      onCopyInvitation(meeting);
    } else {
      const url = `${window.location.origin}/meeting/${meeting.id}`;
      navigator.clipboard.writeText(url);
      onCopySuccess?.(`Copied invite link for "${meetingTopic}" to clipboard!`);
    }
  };

  // Chat is enabled if not ended and not explicitly disabled
  const isChatAvailable = !isEnded && meeting.allow_chat_before_after !== false;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 p-4 sm:p-5 relative group select-none shadow-sm",
        isMenuOpen ? "z-30" : "z-auto",
        /* If currTime < meeting start time -> no card bg color set (transparent / neutral container) */
        isFutureMeeting
          ? "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500"
          : isEnded
          ? "bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 text-text-muted"
          : "bg-white/60 dark:bg-[#1A1A26]/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 text-text-primary",
        className
      )}
    >
      <div className="space-y-1">
        {/* Line 1: [Film Camera Icon with NO background] Meeting Name */}
        <div className="flex items-center gap-2">
          <Video
            className={cn(
              "h-4 w-4 shrink-0",
              isEnded ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-800 dark:text-zinc-200"
            )}
          />
          <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight truncate">
            {meetingTopic}
          </h3>
        </div>

        {/* Line 2: Relative Date (Today, Oct 9) */}
        <p className="text-xs text-text-secondary pl-6">{getRelativeDateLabel()}</p>

        {/* Line 3: Meeting time: From - To */}
        <p className="text-xs text-text-secondary pl-6">{getTimeRangeStr()}</p>

        {/* Line 4: Host: [Host name] */}
        <p className="text-xs text-text-muted pl-6">Host: {hostName}</p>
      </div>

      {/* Bottom Right Actions Bar */}
      <div className="flex items-center justify-end gap-1 mt-2 sm:mt-0 sm:absolute sm:bottom-4 sm:right-4">
        {/* Chat Icon button */}
        {isChatAvailable && (
          <button
            type="button"
            onClick={handleChatClick}
            className="p-1.5 rounded-lg text-text-secondary hover:text-zoom-blue hover:bg-surface-subtle transition-colors cursor-pointer"
            title="Open Meeting Chat"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}

        {/* [...] Context Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            title="Meeting Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Context Dropdown Menu (Opens downwards to prevent clipping by scroll container) */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1C1F2E] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-[99] p-1.5 space-y-1 animate-in fade-in zoom-in-95 text-xs">
              {/* Start / Join Meeting */}
              {!isEnded && (
                <button
                  type="button"
                  onClick={handleStartJoin}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-surface-subtle transition-colors flex items-center gap-2 font-semibold text-text-primary cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-zoom-blue" />
                  <span>{isHost ? "Start Meeting" : "Join Meeting"}</span>
                </button>
              )}

              {/* Copy Invitation */}
              <button
                type="button"
                onClick={handleCopyInviteClick}
                className="w-full px-3 py-2 text-left rounded-xl hover:bg-surface-subtle transition-colors flex items-center gap-2 text-text-primary cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-text-muted" />
                <span>Copy Invitation</span>
              </button>

              {/* Host Options */}
              {isHost && (
                <>
                  <div className="border-t border-app-border my-1" />

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEditMeeting?.(meeting);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-surface-subtle transition-colors flex items-center gap-2 text-text-primary cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-text-muted" />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      if (confirm(`Are you sure you want to delete "${meetingTopic}"?`)) {
                        onDeleteMeeting?.(meeting.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
