"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MeetingCreatePayload } from "@/types/meeting";
import {
  X,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Search,
  Lock,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: MeetingCreatePayload) => Promise<any>;
  defaultTopic?: string;
}

const GLOBAL_TIMEZONES = [
  { label: "(GMT+5:30) India", value: "India (GMT+5:30)" },
  { label: "(GMT-8:00) Pacific Time (US & Canada)", value: "Pacific Time (GMT-8:00)" },
  { label: "(GMT-7:00) Mountain Time (US & Canada)", value: "Mountain Time (GMT-7:00)" },
  { label: "(GMT-6:00) Central Time (US & Canada)", value: "Central Time (GMT-6:00)" },
  { label: "(GMT-5:00) Eastern Time (US & Canada)", value: "Eastern Time (GMT-5:00)" },
  { label: "(GMT+0:00) Greenwich Mean Time (London)", value: "London (GMT+0:00)" },
  { label: "(GMT+1:00) Central European Time (Paris, Berlin)", value: "Central Europe (GMT+1:00)" },
  { label: "(GMT+4:00) Dubai / Gulf Standard Time", value: "Dubai (GMT+4:00)" },
  { label: "(GMT+8:00) Singapore / China Standard Time", value: "Singapore (GMT+8:00)" },
  { label: "(GMT+9:00) Tokyo / Japan Standard Time", value: "Tokyo (GMT+9:00)" },
  { label: "(GMT+10:00) Sydney / AEST", value: "Sydney (GMT+10:00)" },
];

const TIME_INTERVALS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    TIME_INTERVALS.push(`${hh}:${mm}`);
  }
}

function getOrdinalSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getOrdinalWeekday(date: Date) {
  const day = date.getDate();
  const weekNum = Math.ceil(day / 7);
  const ordinals = ["first", "second", "third", "fourth", "fifth"];
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const ord = ordinals[weekNum - 1] || "first";
  const wDay = weekdays[date.getDay()];
  return `${ord} ${wDay}`;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  defaultTopic,
}) => {
  const { currentUser } = useCurrentUser();

  // Basic Details
  const [topic, setTopic] = useState("");
  const [startDateStr, setStartDateStr] = useState("2026-10-09");
  const [startTimeStr, setStartTimeStr] = useState("12:30");
  const [endTimeStr, setEndTimeStr] = useState("13:00");
  const [endDateStr, setEndDateStr] = useState("2026-10-09");

  // Dropdown states
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState("(GMT+5:30) India");
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  // Repeat
  const [repeatOption, setRepeatOption] = useState("Never");
  const [isRepeatOpen, setIsRepeatOpen] = useState(false);

  // Invitees
  const [inviteeInput, setInviteeInput] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [isInviteesExpanded, setIsInviteesExpanded] = useState(true);

  // Meeting ID Selection
  const [meetingIdType, setMeetingIdType] = useState<"auto" | "pmi">("auto");
  const userPmi = currentUser?.pmi || "591 793 6498";

  // Security
  const [passcode, setPasscode] = useState("392184");
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(false);
  const [showPasscodeTooltip, setShowPasscodeTooltip] = useState(false);

  // Meeting Chat
  const [allowChatBeforeAfter, setAllowChatBeforeAfter] = useState(true);

  // Video & Audio Controls
  const [hostVideoOn, setHostVideoOn] = useState(true);
  const [participantVideoOn, setParticipantVideoOn] = useState(true);
  const [audioType, setAudioType] = useState("computer");

  // Advanced Options
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [allowJoinAnytime, setAllowJoinAnytime] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(false);

  // Form handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      const hostName = currentUser?.display_name || "Host";
      setTopic(defaultTopic || `${hostName}'s Zoom Meeting`);

      // Default date to today / next 30 min slot
      const now = new Date();
      const yr = now.getFullYear();
      const mo = (now.getMonth() + 1).toString().padStart(2, "0");
      const da = now.getDate().toString().padStart(2, "0");
      const curDateStr = `${yr}-${mo}-${da}`;

      setStartDateStr(curDateStr);
      setEndDateStr(curDateStr);

      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const nextQuarter = Math.ceil(curMin / 15) * 15;
      const startD = new Date(now);
      if (nextQuarter >= 60) {
        startD.setHours(curHour + 1, 0, 0, 0);
      } else {
        startD.setHours(curHour, nextQuarter, 0, 0);
      }

      const endD = new Date(startD.getTime() + 30 * 60000);
      const sh = startD.getHours().toString().padStart(2, "0");
      const sm = startD.getMinutes().toString().padStart(2, "0");
      const eh = endD.getHours().toString().padStart(2, "0");
      const em = endD.getMinutes().toString().padStart(2, "0");

      setStartTimeStr(`${sh}:${sm}`);
      setEndTimeStr(`${eh}:${em}`);

      // Pregenerate 6-digit random passcode
      setPasscode(Math.floor(100000 + Math.random() * 900000).toString());
      setError(null);
    }
  }, [isOpen, currentUser, defaultTopic]);

  // Derive dynamic repeat options based on current start date & time
  const startDateObj = new Date(`${startDateStr}T${startTimeStr || "12:00"}:00`);
  const dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][startDateObj.getDay()] || "Friday";
  const dayOrdinal = getOrdinalSuffix(startDateObj.getDate() || 9);
  const ordinalWeekday = getOrdinalWeekday(startDateObj);

  const dynamicRepeatList = [
    { label: "Never", value: "Never" },
    { label: `Daily at ${startTimeStr}`, value: `Daily at ${startTimeStr}` },
    { label: `Weekly on ${dayName}`, value: `Weekly on ${dayName}` },
    { label: `Monthly on the ${dayOrdinal}`, value: `Monthly on the ${dayOrdinal}` },
    {
      label: `Every month on the ${ordinalWeekday}`,
      value: `Every month on the ${ordinalWeekday}`,
    },
    { label: "Every weekday (Monday to Friday)", value: "Every weekday (Monday to Friday)" },
  ];

  // Add Invitee
  const handleAddInvitee = () => {
    const trimmed = inviteeInput.trim();
    if (!trimmed) return;
    if (invitees.includes(trimmed)) {
      setInviteeInput("");
      return;
    }
    setInvitees((prev) => [...prev, trimmed]);
    setInviteeInput("");
  };

  const handleRemoveInvitee = (email: string) => {
    setInvitees((prev) => prev.filter((e) => e !== email));
  };

  // Submit Handler
  const handleSave = async () => {
    if (!topic.trim()) {
      setError("Please provide a meeting topic.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate duration in minutes
      const startDateTime = new Date(`${startDateStr}T${startTimeStr}:00`);
      const endDateTime = new Date(`${endDateStr}T${endTimeStr}:00`);
      let durationMinutes = Math.round(
        (endDateTime.getTime() - startDateTime.getTime()) / 60000
      );
      if (durationMinutes <= 0) durationMinutes = 30;

      const payload: MeetingCreatePayload = {
        topic: topic.trim(),
        scheduled_start_time: startDateTime.toISOString(),
        scheduled_end_time: endDateTime.toISOString(),
        duration_minutes: durationMinutes,
        timezone: selectedTimezone,
        repeat_interval: repeatOption,
        use_pmi: meetingIdType === "pmi",
        passcode: passcode.trim() || null,
        waiting_room_enabled: isWaitingRoomEnabled,
        allow_chat_before_after: allowChatBeforeAfter,
        host_video_on: hostVideoOn,
        participant_video_on: participantVideoOn,
        audio_type: audioType,
        allow_join_anytime: allowJoinAnytime,
        mute_participants_on_entry: muteOnEntry,
        invitees: invitees,
      };

      await onSchedule(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to schedule meeting.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredTimezones = GLOBAL_TIMEZONES.filter((tz) =>
    tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      {/* Modal Dialog Card */}
      <div className="relative bg-surface border border-app-border rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl text-text-primary overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 1. Header with Maximize and Close */}
        <div className="px-6 py-4 border-b border-app-border/60 flex items-center justify-between shrink-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
            Schedule Meeting
          </h2>
          <div className="flex items-center gap-1.5 text-text-muted">
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Meeting Topic Input in Muted Box */}
          <div className="bg-zinc-100 dark:bg-[#1E1E2A] border border-app-border rounded-2xl p-3.5 flex items-center shadow-inner">
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setError(null);
              }}
              placeholder="Meeting Topic"
              className="w-full bg-transparent font-bold text-sm sm:text-base text-text-primary focus:outline-none placeholder:text-text-muted"
            />
          </div>

          {/* Date & Time Controls Row: [Start Date] [Start Time] -> [End Time] [End Date] */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              {/* Start Date Pill */}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => {
                    setStartDateStr(e.target.value);
                    setEndDateStr(e.target.value);
                  }}
                  className="w-full bg-surface-subtle border border-app-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:border-zoom-blue transition-colors cursor-pointer"
                />
              </div>

              {/* Start Time Pill with Dropdown */}
              <div className="relative w-24 shrink-0">
                <input
                  type="text"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  onFocus={() => setIsStartTimeOpen(true)}
                  className="w-full bg-surface-subtle border border-app-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary text-center focus:outline-none focus:border-zoom-blue"
                  placeholder="12:30"
                />
                {isStartTimeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsStartTimeOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-28 max-h-48 overflow-y-auto bg-surface border border-app-border rounded-xl shadow-xl z-40 py-1">
                      {TIME_INTERVALS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setStartTimeStr(t);
                            setIsStartTimeOpen(false);
                            // Auto adjust end time to +30 min
                            const [h, m] = t.split(":").map(Number);
                            const endD = new Date();
                            endD.setHours(h, m + 30, 0, 0);
                            const eh = endD.getHours().toString().padStart(2, "0");
                            const em = endD.getMinutes().toString().padStart(2, "0");
                            setEndTimeStr(`${eh}:${em}`);
                          }}
                          className={cn(
                            "w-full px-3 py-1.5 text-xs text-left hover:bg-surface-subtle transition-colors cursor-pointer",
                            startTimeStr === t && "bg-zoom-blue/10 text-zoom-blue font-bold"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Arrow */}
              <span className="text-text-muted font-bold text-xs">→</span>

              {/* End Time Pill with Dropdown */}
              <div className="relative w-24 shrink-0">
                <input
                  type="text"
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  onFocus={() => setIsEndTimeOpen(true)}
                  className="w-full bg-surface-subtle border border-app-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary text-center focus:outline-none focus:border-zoom-blue"
                  placeholder="13:00"
                />
                {isEndTimeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsEndTimeOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-28 max-h-48 overflow-y-auto bg-surface border border-app-border rounded-xl shadow-xl z-40 py-1">
                      {TIME_INTERVALS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setEndTimeStr(t);
                            setIsEndTimeOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-1.5 text-xs text-left hover:bg-surface-subtle transition-colors cursor-pointer",
                            endTimeStr === t && "bg-zoom-blue/10 text-zoom-blue font-bold"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* End Date Pill */}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full bg-surface-subtle border border-app-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary focus:outline-none focus:border-zoom-blue transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Timezone Searchable Dropdown */}
            <div className="relative pt-1">
              <button
                type="button"
                onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <span>{selectedTimezone}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isTimezoneOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsTimezoneOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-72 bg-surface border border-app-border rounded-2xl shadow-2xl z-40 p-2 space-y-1.5 animate-in fade-in zoom-in-95">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
                      <input
                        type="text"
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                        placeholder="Search timezone..."
                        className="w-full bg-surface-subtle border border-app-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-zoom-blue"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-0.5 pt-1">
                      {filteredTimezones.map((tz) => (
                        <button
                          key={tz.value}
                          type="button"
                          onClick={() => {
                            setSelectedTimezone(tz.label);
                            setIsTimezoneOpen(false);
                            setTimezoneSearch("");
                          }}
                          className={cn(
                            "w-full px-2.5 py-1.5 text-xs text-left rounded-lg hover:bg-surface-subtle transition-colors flex items-center justify-between cursor-pointer",
                            selectedTimezone === tz.label &&
                              "bg-zoom-blue/10 text-zoom-blue font-semibold"
                          )}
                        >
                          <span>{tz.label}</span>
                          {selectedTimezone === tz.label && (
                            <Check className="h-3.5 w-3.5 text-zoom-blue" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Repeat Recurrence Selector (Screenshot 2) */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-semibold text-text-secondary">Repeat</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRepeatOpen(!isRepeatOpen)}
                  className="bg-surface-subtle hover:bg-surface-hover border border-app-border rounded-xl px-3 py-1.5 text-xs font-medium text-text-primary flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>{repeatOption}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                </button>

                {isRepeatOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsRepeatOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-app-border rounded-2xl shadow-2xl z-40 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
                      {dynamicRepeatList.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setRepeatOption(item.value);
                            setIsRepeatOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-xs text-left rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between cursor-pointer",
                            repeatOption === item.value &&
                              "bg-zoom-blue/10 text-zoom-blue font-bold"
                          )}
                        >
                          <span>{item.label}</span>
                          {repeatOption === item.value && (
                            <Check className="h-3.5 w-3.5 text-zoom-blue" />
                          )}
                        </button>
                      ))}
                      <div className="border-t border-app-border my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setRepeatOption("Custom...");
                          setIsRepeatOpen(false);
                        }}
                        className="w-full px-3 py-2 text-xs text-left rounded-xl hover:bg-surface-subtle transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
                      >
                        Custom...
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Invitees Section (Screenshot 3) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-text-primary block">Invitees</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={inviteeInput}
                onChange={(e) => setInviteeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddInvitee();
                  }
                }}
                placeholder="Add invitees"
                className="flex-1 bg-surface-subtle border border-app-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-zoom-blue transition-colors"
              />
              <button
                type="button"
                onClick={handleAddInvitee}
                className="bg-surface-subtle hover:bg-surface-hover border border-app-border text-text-primary px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Collapsible Invitee Counter & Tiles List */}
            {invitees.length > 0 && (
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsInviteesExpanded(!isInviteesExpanded)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <span>
                    {invitees.length} {invitees.length === 1 ? "invitee" : "invitees"}
                  </span>
                  {isInviteesExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {isInviteesExpanded && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {invitees.map((email) => {
                      const initial = (email[0] || "U").toUpperCase();
                      return (
                        <div
                          key={email}
                          className="flex items-center justify-between rounded-xl bg-[#F4E3E6] dark:bg-[#32171C] border border-[#EAC4CC] dark:border-[#52242D] overflow-hidden p-2 pl-0 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Burgundy Left Accent Bar */}
                            <div className="w-1.5 h-8 bg-[#8B1A2B] rounded-r" />

                            {/* Avatar Icon */}
                            <div className="w-7 h-7 bg-[#8B1A2B] text-white font-bold rounded-lg flex items-center justify-center text-xs shrink-0 shadow-sm">
                              {initial}
                            </div>

                            {/* Email Text */}
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {email}
                            </span>

                            {/* EXTERNAL badge */}
                            <span className="bg-white/90 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-black/5 uppercase tracking-wider shrink-0">
                              EXTERNAL
                            </span>
                          </div>

                          {/* Delete X Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveInvitee(email)}
                            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Remove Invitee"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meeting ID Section */}
          <div className="space-y-2 pt-2 border-t border-app-border/40">
            <label className="text-xs font-bold text-text-primary block">Meeting ID</label>
            <div className="flex items-center gap-6 flex-wrap text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="meetingIdType"
                  checked={meetingIdType === "auto"}
                  onChange={() => setMeetingIdType("auto")}
                  className="h-4 w-4 text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
                />
                <span className="font-medium text-text-primary">Generate Automatically</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="meetingIdType"
                  checked={meetingIdType === "pmi"}
                  onChange={() => setMeetingIdType("pmi")}
                  className="h-4 w-4 text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
                />
                <span className="font-medium text-text-primary">
                  Personal Meeting ID {userPmi}
                </span>
              </label>
            </div>
          </div>

          {/* Meeting Security Section */}
          <div className="space-y-3 pt-2 border-t border-app-border/40">
            <label className="text-xs font-bold text-text-primary block">Meeting Security</label>

            {/* Passcode Row */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800 border-app-border text-zinc-400 cursor-not-allowed opacity-75"
                />
                <span className="text-xs font-semibold text-text-secondary">Passcode</span>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-28 bg-surface-subtle border border-app-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-text-primary focus:outline-none focus:border-zoom-blue"
                  placeholder="392184"
                />
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowPasscodeTooltip(true)}
                    onMouseLeave={() => setShowPasscodeTooltip(false)}
                    className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  {showPasscodeTooltip && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 bg-zinc-900 text-white text-[11px] rounded-xl p-2.5 shadow-2xl z-50 animate-in fade-in leading-relaxed pointer-events-none">
                      Users with link have passcode embedded in the link and do not need to enter it while joining.
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-text-muted pl-6">
                Only users who have the invite link or passcode can join the meeting
              </p>
            </div>

            {/* Waiting Room Row */}
            <div className="space-y-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isWaitingRoomEnabled}
                  onChange={(e) => setIsWaitingRoomEnabled(e.target.checked)}
                  className="h-4 w-4 rounded bg-surface border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
                />
                <span className="text-xs font-semibold text-text-primary">Waiting Room</span>
              </label>
              <p className="text-[11px] text-text-muted pl-6">
                Only users admitted by the host can join the meeting
              </p>
            </div>
          </div>

          {/* Meeting Chat Section */}
          <div className="space-y-1.5 pt-2 border-t border-app-border/40">
            <label className="text-xs font-bold text-text-primary block">Meeting Chat:</label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowChatBeforeAfter}
                onChange={(e) => setAllowChatBeforeAfter(e.target.checked)}
                className="h-4 w-4 rounded bg-surface border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
              />
              <span className="text-xs text-text-secondary">
                Allow users to access meeting chats before and after the meeting
              </span>
            </label>
          </div>

          {/* Video Controls: Host On/Off & Participant On/Off */}
          <div className="space-y-2 pt-2 border-t border-app-border/40">
            <label className="text-xs font-bold text-text-primary block">Video:</label>
            <div className="flex items-center gap-8 text-xs">
              {/* Host Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-text-secondary font-medium">Host:</span>
                <button
                  type="button"
                  onClick={() => setHostVideoOn(!hostVideoOn)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    hostVideoOn ? "bg-zoom-blue" : "bg-zinc-300 dark:bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                      hostVideoOn ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
                <span className="text-xs font-semibold text-text-primary">
                  {hostVideoOn ? "On" : "Off"}
                </span>
              </div>

              {/* Participant Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-text-secondary font-medium">Participant:</span>
                <button
                  type="button"
                  onClick={() => setParticipantVideoOn(!participantVideoOn)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    participantVideoOn ? "bg-zoom-blue" : "bg-zinc-300 dark:bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                      participantVideoOn ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
                <span className="text-xs font-semibold text-text-primary">
                  {participantVideoOn ? "On" : "Off"}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Section */}
          <div className="space-y-2 pt-2 border-t border-app-border/40">
            <label className="text-xs font-bold text-text-primary block">Audio:</label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input
                type="radio"
                name="audioType"
                value="computer"
                checked={audioType === "computer"}
                onChange={() => setAudioType("computer")}
                className="h-4 w-4 text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
              />
              <span className="font-medium text-text-primary">Computer Audio</span>
            </label>
          </div>

          {/* Advanced Options (Collapsible Section) */}
          <div className="pt-2 border-t border-app-border/40 space-y-2">
            <button
              type="button"
              onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
              className="flex items-center gap-1.5 text-xs font-bold text-text-primary hover:text-zoom-blue transition-colors cursor-pointer select-none"
            >
              <span>Advanced Options</span>
              {isAdvancedExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {isAdvancedExpanded && (
              <div className="space-y-2 pl-3 pt-1 animate-in fade-in duration-150">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={allowJoinAnytime}
                    onChange={(e) => setAllowJoinAnytime(e.target.checked)}
                    className="h-4 w-4 rounded bg-surface border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
                  />
                  <span className="text-text-secondary">Allow participants to join anytime</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
                  <input
                    type="checkbox"
                    checked={muteOnEntry}
                    onChange={(e) => setMuteOnEntry(e.target.checked)}
                    className="h-4 w-4 rounded bg-surface border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
                  />
                  <span className="text-text-secondary">Mute participants upon entry</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 3. Modal Footer with More Options and Save Button */}
        <div className="px-6 py-3.5 border-t border-app-border/60 flex items-center justify-between bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            className="text-xs text-zoom-blue hover:underline font-semibold cursor-pointer"
          >
            More Options
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="bg-zoom-blue hover:bg-zoom-blue-hover text-white px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-zoom-blue/20 hover:shadow-zoom-blue/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
