"use client";

import React from "react";
import { Meeting } from "@/types/meeting";
import { Video, MoreHorizontal, MessageSquare, Play, Trash2, Edit3, Copy } from "lucide-react";
import { formatMeetingTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface DayPlannerViewProps {
  selectedDate: Date;
  meetings: Meeting[];
  currentUserId?: string;
  onOpenCopyInvitation: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
}

export const DayPlannerView: React.FC<DayPlannerViewProps> = ({
  selectedDate,
  meetings,
  currentUserId,
  onOpenCopyInvitation,
  onDeleteMeeting,
}) => {
  const router = useRouter();

  // Generate 24 hour slots: 00:00 to 23:00
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hh = i.toString().padStart(2, "0");
    return `${hh}:00`;
  });

  // Group meetings by starting hour on the selectedDate
  const getMeetingsForHour = (hourIndex: number) => {
    return meetings.filter((m) => {
      if (!m.scheduled_start_time) return false;
      const mDate = new Date(m.scheduled_start_time);
      // Check if same calendar date
      const isSameDay =
        mDate.getFullYear() === selectedDate.getFullYear() &&
        mDate.getMonth() === selectedDate.getMonth() &&
        mDate.getDate() === selectedDate.getDate();

      if (!isSameDay) return false;
      return mDate.getHours() === hourIndex;
    });
  };

  return (
    <div className="w-full bg-surface border border-app-border rounded-2xl overflow-hidden shadow-sm">
      <div className="divide-y divide-app-border/60 max-h-[520px] overflow-y-auto">
        {hours.map((hourStr, hourIdx) => {
          const hourMeetings = getMeetingsForHour(hourIdx);

          return (
            <div
              key={hourStr}
              className="flex items-stretch min-h-[58px] group/hour hover:bg-surface-subtle/30 transition-colors"
            >
              {/* Left Column: Time label */}
              <div className="w-20 sm:w-24 shrink-0 px-3 sm:px-4 py-2 text-xs font-mono text-text-muted border-r border-app-border/80 flex items-start select-none">
                {hourStr}
              </div>

              {/* Right Column: Events Slot */}
              <div className="flex-1 p-1.5 sm:p-2 flex flex-col gap-1.5 justify-center">
                {hourMeetings.map((meeting) => {
                  const isHost = currentUserId === meeting.host_id;
                  const topic = meeting.topic || meeting.title || "Zoom Meeting";

                  const startD = meeting.scheduled_start_time ? new Date(meeting.scheduled_start_time) : new Date();
                  const endD = meeting.scheduled_end_time
                    ? new Date(meeting.scheduled_end_time)
                    : new Date(startD.getTime() + (meeting.duration_minutes || 30) * 60000);

                  const timeRangeStr = `${formatMeetingTime(startD.toISOString())} - ${formatMeetingTime(endD.toISOString())}`;

                  const handleItemClick = () => {
                    if (isHost && typeof window !== "undefined") {
                      sessionStorage.setItem(`zoom_host_${meeting.id}`, "true");
                      router.push(`/meeting/${meeting.id}?host=1`);
                    } else {
                      router.push(`/meeting/${meeting.id}`);
                    }
                  };

                  return (
                    <div
                      key={meeting.id}
                      onClick={handleItemClick}
                      className="group relative flex items-center justify-between bg-[#D9EAFE] dark:bg-[#1E3A8A]/40 hover:bg-[#C9E0FE] dark:hover:bg-[#1E3A8A]/60 border border-[#BFDBFE] dark:border-[#1E40AF]/60 rounded-xl px-3 py-2 text-xs text-[#1E40AF] dark:text-[#93C5FD] transition-all cursor-pointer shadow-sm"
                    >
                      {/* Left: Blue Accent bar + Film camera + Topic + Time */}
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {/* Film Camera icon with rounded badge */}
                        <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Video className="h-3.5 w-3.5" />
                        </div>

                        <span className="font-semibold truncate">
                          {topic}, {timeRangeStr}
                        </span>
                      </div>

                      {/* Right: Quick actions on hover */}
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Chat Icon (if allowed) */}
                        {meeting.allow_chat_before_after && (
                          <button
                            type="button"
                            onClick={() => router.push(`/chat?meetingId=${meeting.id}`)}
                            className="p-1 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-300/40 dark:hover:bg-blue-800/60 transition-colors cursor-pointer"
                            title="Open Meeting Chat"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Copy Invite */}
                        <button
                          type="button"
                          onClick={() => onOpenCopyInvitation(meeting)}
                          className="p-1 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-300/40 dark:hover:bg-blue-800/60 transition-colors cursor-pointer"
                          title="Copy Invitation"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        {/* Start / Join */}
                        <button
                          type="button"
                          onClick={handleItemClick}
                          className="px-2 py-0.5 rounded-lg bg-[#2563EB] text-white font-semibold text-[11px] hover:bg-[#1D4ED8] transition-colors cursor-pointer shadow-sm"
                        >
                          {isHost ? "Start" : "Join"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
