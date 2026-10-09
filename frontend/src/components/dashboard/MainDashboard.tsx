"use client";

import React from "react";
import { ClockWidget } from "@/components/dashboard/ClockWidget";
import { ActionCards } from "@/components/dashboard/ActionCards";
import { MeetingTabs } from "@/components/dashboard/MeetingTabs";
import { Meeting } from "@/types/meeting";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MainDashboardProps {
  upcomingMeetings: Meeting[];
  activeMeetings: Meeting[];
  recentMeetings: Meeting[];
  currentUserId?: string;
  currentUserName?: string;
  onOpenSchedule: () => void;
  onOpenNewMeeting: () => void;
  onOpenJoin: () => void;
  onOpenShareScreen: () => void;
  onDeleteMeeting?: (id: string) => Promise<boolean> | Promise<void> | void;
  className?: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  upcomingMeetings,
  activeMeetings,
  recentMeetings,
  currentUserId,
  currentUserName,
  onOpenSchedule,
  onOpenNewMeeting,
  onOpenJoin,
  onOpenShareScreen,
  onDeleteMeeting,
  className,
}) => {
  return (
    <main
      className={cn(
        "flex-1 bg-white dark:bg-[#181824] rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden h-full flex flex-col items-center relative transition-colors duration-200 border border-black/5 dark:border-white/5",
        className
      )}
    >
      {/* Top Right AI Sparkle Assistant Button (from Desktop Screenshot) */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10">
        <button
          type="button"
          onClick={() => alert("Zoom Workplace AI Companion")}
          className="p-2 rounded-full text-text-muted hover:text-zoom-blue hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group"
          title="Zoom AI Companion"
        >
          <Sparkles className="h-5 w-5 text-text-muted group-hover:text-zoom-blue transition-colors" />
        </button>
      </div>

      {/* Centered Dashboard Content: Dashboard container does NOT scroll; only MeetingTabs scrolls */}
      <div className="w-full max-w-3xl flex-1 min-h-0 flex flex-col items-center space-y-4 sm:space-y-5 py-1">
        {/* 1. Real-time Minimalist Clock Widget */}
        <div className="shrink-0">
          <ClockWidget />
        </div>

        {/* 2. 5 Official Action Buttons */}
        <div className="shrink-0 w-full">
          <ActionCards
            onNewMeeting={onOpenNewMeeting}
            onJoin={onOpenJoin}
            onSchedule={onOpenSchedule}
            onShareScreen={onOpenShareScreen}
          />
        </div>

        {/* 3. Meeting Agenda / Day Planner Card (takes remaining height, internal scroll only) */}
        <div className="w-full flex-1 min-h-0 flex flex-col">
          <MeetingTabs
            upcomingMeetings={upcomingMeetings}
            activeMeetings={activeMeetings}
            recentMeetings={recentMeetings}
            currentUserId={currentUserId}
            currentUserName={currentUserName || "Host"}
            onOpenSchedule={onOpenSchedule}
            onOpenNewMeeting={onOpenNewMeeting}
            onDeleteMeeting={onDeleteMeeting ? async (id: string) => { await onDeleteMeeting(id); return true; } : undefined}
          />
        </div>
      </div>
    </main>
  );
};
