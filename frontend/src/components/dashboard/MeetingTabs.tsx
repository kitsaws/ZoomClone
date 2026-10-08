"use client";

import React, { useState } from "react";
import { Meeting } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";
import { Button } from "@/components/ui/Button";
import { Calendar, Video, Clock, Search, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MeetingTabsProps {
  upcomingMeetings: Meeting[];
  activeMeetings: Meeting[];
  recentMeetings: Meeting[];
  currentUserId?: string;
  onOpenSchedule: () => void;
  onOpenNewMeeting: () => void;
  className?: string;
}

type TabType = "upcoming" | "active" | "recent";

export const MeetingTabs: React.FC<MeetingTabsProps> = ({
  upcomingMeetings,
  activeMeetings,
  recentMeetings,
  currentUserId,
  onOpenSchedule,
  onOpenNewMeeting,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get active list
  const currentList =
    activeTab === "upcoming"
      ? upcomingMeetings
      : activeTab === "active"
      ? activeMeetings
      : recentMeetings;

  // Filter list by topic or ID
  const filteredList = currentList.filter(
    (m) =>
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meeting_number.includes(searchQuery)
  );

  return (
    <div className={cn("space-y-6 relative", className)}>
      {/* Floating Clipboard Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-zoom-dark-canvas text-white px-4 py-3 rounded-2xl shadow-2xl border border-zoom-border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Controls: Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-app-border pb-4">
        {/* Tab Pills */}
        <div className="flex items-center gap-2 bg-surface-subtle border border-app-border rounded-xl p-1 shadow-sm overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "upcoming"
                ? "bg-surface text-zoom-blue shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Upcoming ({upcomingMeetings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "active"
                ? "bg-surface text-zoom-blue shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <span className="relative flex h-2.5 w-2.5">
              {activeMeetings.length > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>Live Rooms ({activeMeetings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("recent")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "recent"
                ? "bg-surface text-zoom-blue shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Past History ({recentMeetings.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search meetings by topic or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-app-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-zoom-blue focus:ring-2 focus:ring-zoom-blue/20 shadow-sm"
          />
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="space-y-3.5">
        {filteredList.length > 0 ? (
          filteredList.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              currentUserId={currentUserId}
              onCopySuccess={showToast}
            />
          ))
        ) : (
          /* Empty State */
          <div className="bg-surface border border-app-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="h-16 w-16 bg-surface-subtle text-text-muted rounded-full flex items-center justify-center mx-auto border border-app-border">
              {activeTab === "upcoming" ? (
                <Calendar className="h-8 w-8 text-zoom-blue" />
              ) : activeTab === "active" ? (
                <Video className="h-8 w-8 text-emerald-500" />
              ) : (
                <Clock className="h-8 w-8 text-text-muted" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                {activeTab === "upcoming"
                  ? "No upcoming meetings scheduled"
                  : activeTab === "active"
                  ? "No meetings currently in progress"
                  : "No past meeting history found"}
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {activeTab === "upcoming"
                  ? "Schedule a meeting in advance to invite teammates and generate personal room links."
                  : activeTab === "active"
                  ? "Start an instant meeting with 1-click HD video and crystal-clear audio."
                  : "Completed calls and durations will appear here."}
              </p>
            </div>

            {activeTab === "upcoming" && (
              <Button
                variant="primary"
                size="md"
                onClick={onOpenSchedule}
                leftIcon={<Plus className="h-4 w-4" />}
                className="mt-2 rounded-xl px-6 font-semibold"
              >
                Schedule Meeting
              </Button>
            )}

            {activeTab === "active" && (
              <Button
                variant="orange"
                size="md"
                onClick={onOpenNewMeeting}
                leftIcon={<Video className="h-4 w-4" />}
                className="mt-2 rounded-xl px-6 font-semibold"
              >
                Start Instant Meeting
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
