"use client";

import React, { useState, useRef, useEffect } from "react";
import { Meeting } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";
import { DayPlannerView } from "./DayPlannerView";
import { CopyInvitationModal } from "@/components/modals/CopyInvitationModal";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  ArrowRight,
  List,
  Check,
  X,
  RotateCw,
  ExternalLink,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MeetingTabsProps {
  upcomingMeetings: Meeting[];
  activeMeetings: Meeting[];
  recentMeetings: Meeting[];
  currentUserId?: string;
  currentUserName?: string;
  onOpenSchedule: () => void;
  onOpenNewMeeting?: () => void;
  onDeleteMeeting?: (meetingId: string) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  className?: string;
}

export const MeetingTabs: React.FC<MeetingTabsProps> = ({
  upcomingMeetings,
  activeMeetings,
  recentMeetings,
  currentUserId,
  currentUserName = "Swastik Nagpal",
  onOpenSchedule,
  onOpenNewMeeting,
  onDeleteMeeting,
  onEditMeeting,
  className,
}) => {
  // 1. Date State (Initialized to fixed baseline date for SSR, updated in useEffect)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 9, 9));
  const [currentToday, setCurrentToday] = useState<Date>(() => new Date(2026, 9, 9));
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
    setCurrentToday(now);
  }, []);

  // 2. View Mode: "agenda" (default) or "day"
  const [viewMode, setViewMode] = useState<"agenda" | "day">("agenda");

  // 3. Dropdown Menu & Filters State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [filterHostedByYou, setFilterHostedByYou] = useState(false);
  const [filterWithChat, setFilterWithChat] = useState(false);
  const [showInstantMeetings, setShowInstantMeetings] = useState(true);

  // 4. Copy Invitation Modal State
  const [copyModalMeeting, setCopyModalMeeting] = useState<Meeting | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close menu on outside click
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

  // Check if selected date is today
  const isToday =
    selectedDate.getFullYear() === currentToday.getFullYear() &&
    selectedDate.getMonth() === currentToday.getMonth() &&
    selectedDate.getDate() === currentToday.getDate();

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleGoToToday = () => {
    setSelectedDate(currentToday);
  };

  const handleOpenNativeCalendar = () => {
    if (datePickerRef.current) {
      try {
        if ("showPicker" in HTMLInputElement.prototype) {
          datePickerRef.current.showPicker();
        } else {
          datePickerRef.current.click();
        }
      } catch {
        datePickerRef.current.click();
      }
    }
  };

  // Format Top Bar Date Label: "Today, Oct 9" / "Tomorrow, Oct 10" / "Fri, Oct 16"
  const getTopBarDateLabel = () => {
    const monthDay = selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (isToday) return `Today, ${monthDay}`;

    const tomorrow = new Date(currentToday);
    tomorrow.setDate(currentToday.getDate() + 1);
    const isTomorrow =
      selectedDate.getFullYear() === tomorrow.getFullYear() &&
      selectedDate.getMonth() === tomorrow.getMonth() &&
      selectedDate.getDate() === tomorrow.getDate();
    if (isTomorrow) return `Tomorrow, ${monthDay}`;

    const yesterday = new Date(currentToday);
    yesterday.setDate(currentToday.getDate() - 1);
    const isYesterday =
      selectedDate.getFullYear() === yesterday.getFullYear() &&
      selectedDate.getMonth() === yesterday.getMonth() &&
      selectedDate.getDate() === yesterday.getDate();
    if (isYesterday) return `Yesterday, ${monthDay}`;

    const weekday = selectedDate.toLocaleDateString("en-US", { weekday: "short" });
    return `${weekday}, ${monthDay}`;
  };

  // Combine meetings and filter
  const allMeetings = [...activeMeetings, ...upcomingMeetings, ...recentMeetings];
  // Deduplicate by ID
  const uniqueMeetingsMap = new Map<string, Meeting>();
  allMeetings.forEach((m) => uniqueMeetingsMap.set(m.id, m));
  const uniqueMeetings = Array.from(uniqueMeetingsMap.values());

  // Filter meetings by selected date and active filter flags
  const filteredMeetings = uniqueMeetings.filter((m) => {
    // 1. Date Filter
    const meetingTimeStr = m.scheduled_start_time || m.start_time;
    if (meetingTimeStr) {
      const mDate = new Date(meetingTimeStr);
      const sameDay =
        mDate.getFullYear() === selectedDate.getFullYear() &&
        mDate.getMonth() === selectedDate.getMonth() &&
        mDate.getDate() === selectedDate.getDate();
      if (!sameDay) return false;
    } else {
      // Instant meeting without scheduled start time: show if instant meetings enabled & viewed day is today
      if (!showInstantMeetings) return false;
      if (!isToday) return false;
    }

    // 2. Filter by "Hosted by you"
    if (filterHostedByYou && currentUserId && m.host_id !== currentUserId) {
      return false;
    }

    // 3. Filter by "With meeting chat"
    if (filterWithChat && m.allow_chat_before_after === false) {
      return false;
    }

    return true;
  });

  // Sort meetings according to their start times (ascending order)
  filteredMeetings.sort((a, b) => {
    const timeA = new Date(a.scheduled_start_time || a.start_time || a.created_at || 0).getTime();
    const timeB = new Date(b.scheduled_start_time || b.start_time || b.created_at || 0).getTime();
    return timeA - timeB;
  });

  const hasActiveFilterChips = filterHostedByYou || filterWithChat;

  return (
    <div className={cn("w-full bg-surface border border-app-border rounded-3xl shadow-sm overflow-hidden flex flex-col select-none", className)}>
      {/* 1. TOP BAR (Screenshot 1: (+) on left, centered [Today, Oct 9 v]) */}
      <div className="px-5 py-3 border-b border-app-border/80 flex items-center justify-between bg-surface/90 backdrop-blur-sm relative">
        {/* Left: + Schedule Button */}
        <button
          type="button"
          onClick={onOpenSchedule}
          className="p-1.5 rounded-xl hover:bg-surface-subtle text-text-primary hover:text-zoom-blue transition-colors cursor-pointer"
          title="Schedule New Meeting"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Center: Directly opens Native Calendar Picker on click */}
        <div className="relative">
          {/* Invisible HTML5 date input triggered by showPicker() */}
          <input
            type="date"
            ref={datePickerRef}
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setSelectedDate(new Date(y, m - 1, d));
              }
            }}
            className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={handleOpenNativeCalendar}
            className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-text-primary hover:text-zoom-blue transition-colors cursor-pointer"
            title="Click to open calendar"
          >
            <span>{getTopBarDateLabel()}</span>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        {/* Right empty spacer for perfect center alignment */}
        <div className="w-7" />
      </div>

      {/* 2. BAR UNDER TOP BAR (Screenshot 1: Today Pill, < >, and rightmost [...] menu) */}
      <div className="px-5 py-2.5 border-b border-app-border/60 flex items-center justify-between gap-3 bg-surface-subtle/30">
        {/* Left Controls: Today Pill + < > Day Steppers */}
        <div className="flex items-center gap-2">
          {/* Today Pill Button: bg stays consistent, icon changes to Arrow if not today */}
          <button
            type="button"
            onClick={handleGoToToday}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-app-border bg-surface text-text-primary hover:bg-surface-hover transition-colors cursor-pointer shadow-sm"
            title={isToday ? "Current Day (Today)" : "Return to Today"}
          >
            {isToday ? (
              <CalendarIcon className="h-3.5 w-3.5 text-text-muted" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 text-zoom-blue" />
            )}
            <span>Today</span>
          </button>

          {/* Left Arrow (<) */}
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Right Arrow (>) */}
          <button
            type="button"
            onClick={handleNextDay}
            className="p-1 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Rightmost [...] Dropdown Menu (Screenshot 2) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            title="View & Filter Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Screenshot 2 Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface border border-app-border rounded-2xl shadow-2xl z-50 p-2 space-y-2 animate-in fade-in zoom-in-95 text-xs">
              {/* VIEW SECTION */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-text-muted px-2.5 block">View</span>

                {/* Day View Option */}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("day");
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between cursor-pointer",
                    viewMode === "day" && "border border-zoom-blue text-zoom-blue font-bold bg-zoom-blue/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Day</span>
                  </div>
                  {viewMode === "day" && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
                </button>

                {/* Agenda View Option */}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("agenda");
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between cursor-pointer",
                    viewMode === "agenda" && "border border-zoom-blue text-zoom-blue font-bold bg-zoom-blue/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <List className="h-3.5 w-3.5" />
                    <span>Agenda</span>
                  </div>
                  {viewMode === "agenda" && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
                </button>
              </div>

              <div className="border-t border-app-border/80" />

              {/* FILTER BY SECTION */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-text-muted px-2.5 block">Filter by</span>

                {/* Hosted by you */}
                <button
                  type="button"
                  onClick={() => setFilterHostedByYou(!filterHostedByYou)}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between text-text-primary cursor-pointer"
                >
                  <span>Hosted by you</span>
                  {filterHostedByYou && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
                </button>

                {/* With meeting chat */}
                <button
                  type="button"
                  onClick={() => setFilterWithChat(!filterWithChat)}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between text-text-primary cursor-pointer"
                >
                  <span>With meeting chat</span>
                  {filterWithChat && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
                </button>

                {/* Show instant meetings */}
                <label className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showInstantMeetings}
                      onChange={(e) => setShowInstantMeetings(e.target.checked)}
                      className="h-3.5 w-3.5 rounded text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
                    />
                    <span className="text-text-primary">Show instant meetings</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="bg-zoom-blue/10 text-zoom-blue font-bold px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  </div>
                </label>
              </div>

              <div className="border-t border-app-border/80" />

              {/* HOST BY SECTION */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-text-muted px-2.5 block">Host by</span>
                <div className="px-2.5 py-1.5 rounded-xl flex items-center justify-between font-medium text-text-primary">
                  <span>{currentUserName}</span>
                  <Check className="h-3.5 w-3.5 text-zoom-blue" />
                </div>
              </div>

              <div className="border-t border-app-border/80" />

              {/* ACTIONS SECTION */}
              <div className="space-y-0.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => alert("Manage Privileges dialog")}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Manage privileges</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    showToast("Meetings list refreshed.");
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="border-t border-app-border/80 pt-1" />

              <a
                href="https://zoom.us"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-[11px] text-zoom-blue hover:underline flex items-center gap-1 cursor-pointer block"
              >
                <span>Filter meetings by assets in Zoom Hub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 3. ACTIVE FILTER CHIPS BAR (Screenshot 3) */}
      {hasActiveFilterChips && (
        <div className="px-5 py-2 border-b border-app-border/60 flex items-center gap-2 flex-wrap bg-surface-subtle/20">
          {filterHostedByYou && (
            <span className="inline-flex items-center gap-1.5 bg-surface border border-app-border rounded-xl px-2.5 py-1 text-xs font-semibold text-text-primary shadow-sm">
              <span>Hosted by you</span>
              <button
                type="button"
                onClick={() => setFilterHostedByYou(false)}
                className="hover:text-rose-500 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {filterWithChat && (
            <span className="inline-flex items-center gap-1.5 bg-surface border border-app-border rounded-xl px-2.5 py-1 text-xs font-semibold text-text-primary shadow-sm">
              <span>With meeting chat</span>
              <button
                type="button"
                onClick={() => setFilterWithChat(false)}
                className="hover:text-rose-500 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* 4. MAIN SCROLLABLE CONTENT (Agenda vs. Day Planner) */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[560px]">
        {viewMode === "day" ? (
          /* Day Planner View (Screenshot 3) */
          <DayPlannerView
            selectedDate={selectedDate}
            meetings={filteredMeetings}
            currentUserId={currentUserId}
            onOpenCopyInvitation={(m) => setCopyModalMeeting(m)}
            onDeleteMeeting={onDeleteMeeting}
          />
        ) : (
          /* Agenda View (Screenshot 1) */
          <div className="space-y-3">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  currentUserId={currentUserId}
                  onCopyInvitation={(m) => setCopyModalMeeting(m)}
                  onEditMeeting={onEditMeeting}
                  onDeleteMeeting={onDeleteMeeting}
                  onCopySuccess={showToast}
                />
              ))
            ) : (
              /* Clean Empty State */
              <div className="bg-surface-subtle/40 border border-app-border rounded-2xl p-8 text-center space-y-3">
                <CalendarIcon className="h-8 w-8 text-text-muted mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text-primary">
                    No meetings scheduled for this date
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Click the + button above to schedule a new meeting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenSchedule}
                  className="bg-zoom-blue hover:bg-zoom-blue-hover text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Schedule Meeting
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. COPY INVITATION MODAL (Screenshot 4) */}
      <CopyInvitationModal
        isOpen={!!copyModalMeeting}
        onClose={() => setCopyModalMeeting(null)}
        meeting={copyModalMeeting}
        hostName={currentUserName}
      />
    </div>
  );
};
