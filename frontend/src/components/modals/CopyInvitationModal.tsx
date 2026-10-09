"use client";

import React, { useState } from "react";
import { Meeting } from "@/types/meeting";
import { X, Info, Check, Copy, Calendar } from "lucide-react";
import { formatMeetingId, formatMeetingTime, formatMeetingDate } from "@/lib/utils";

export interface CopyInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  hostName?: string;
}

export const CopyInvitationModal: React.FC<CopyInvitationModalProps> = ({
  isOpen,
  onClose,
  meeting,
  hostName = "Host",
}) => {
  const [showCalendarBanner, setShowCalendarBanner] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !meeting) return null;

  const topic = meeting.topic || meeting.title || "Zoom Meeting";
  const host = hostName || meeting.host?.display_name || "Host";
  const meetingNumber = meeting.meeting_number ? formatMeetingId(meeting.meeting_number) : "849 2018 3921";
  const passcode = meeting.passcode || "4WWpDg";
  const timezone = meeting.timezone || "India";

  // Format date and time
  const startDate = meeting.scheduled_start_time ? new Date(meeting.scheduled_start_time) : new Date();
  const dateFormatted = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const joinUrl = `${origin}/meeting/${meeting.id}${passcode ? `?pwd=${passcode}` : ""}`;
  const chatUrl = `${origin}/chat?meetingId=${meeting.id}`;

  const invitationText = `${host} is inviting you to a scheduled Zoom meeting.

Topic: ${topic}
Time: ${dateFormatted} ${timeFormatted} ${timezone}

Join Zoom Meeting
${joinUrl}

Meeting chat link
${chatUrl}

Meeting ID: ${meetingNumber}
Passcode: ${passcode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadIcs = () => {
    const duration = meeting.duration_minutes || 30;
    const end = new Date(startDate.getTime() + duration * 60000);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const toICSDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Zoom Workplace Clone//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${meeting.id}@zoomclone.local`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${topic}`,
      `DESCRIPTION:${invitationText.replace(/\n/g, "\\n")}`,
      `LOCATION:${joinUrl}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${topic.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      {/* Modal Dialog Card */}
      <div className="relative bg-surface border border-app-border rounded-2xl w-full max-w-lg shadow-2xl text-text-primary overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* 1. Window Title Bar (Screenshot 4: dark navy top bar with zm logo) */}
        <div className="bg-[#1A233A] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#2D8CFF] rounded-md flex items-center justify-center font-bold text-[10px] text-white tracking-tighter">
              zm
            </div>
            <span className="text-xs font-semibold tracking-wide">Zoom - schedule meeting</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Calendar connection info alert banner */}
          {showCalendarBanner && (
            <div className="bg-[#EBF3FF] dark:bg-[#1E293B] border border-[#CDE1FF] dark:border-[#334155] rounded-xl p-3 flex items-start justify-between gap-3 text-xs text-[#0B3B8B] dark:text-[#93C5FD]">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2D8CFF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Info className="h-3.5 w-3.5" />
                </div>
                <div className="leading-relaxed">
                  You haven&apos;t connected your calendar yet.{" "}
                  <button
                    type="button"
                    onClick={() => alert("Calendar integration available with Google Calendar & Outlook.")}
                    className="font-semibold underline hover:text-[#0055CC] dark:hover:text-white cursor-pointer"
                  >
                    Connect now
                  </button>{" "}
                  to manage all your meetings and events in one place.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarBanner(false)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Titles */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">
              Your meeting has been scheduled.
            </h3>
            <p className="text-xs text-text-secondary">
              Click the button below to copy the invitation to clipboard.
            </p>
          </div>

          {/* Formatted Invitation Preformatted Box (Screenshot 4) */}
          <div className="bg-surface-subtle border border-app-border rounded-xl p-4 font-sans text-xs text-text-primary leading-relaxed whitespace-pre-wrap select-text font-normal shadow-inner max-h-56 overflow-y-auto">
            {invitationText}
          </div>
        </div>

        {/* 3. Modal Footer (Screenshot 4) */}
        <div className="px-6 py-4 border-t border-app-border flex items-center justify-between bg-surface shrink-0">
          {/* Left: Open with .ics */}
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="text-xs font-semibold text-text-primary hover:text-zoom-blue hover:underline transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5 text-text-muted" />
            <span>Open with default calendar (.ics)</span>
          </button>

          {/* Right: Copy to clipboard button */}
          <button
            type="button"
            onClick={handleCopy}
            className="bg-zoom-blue hover:bg-zoom-blue-hover text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-zoom-blue/20 hover:shadow-zoom-blue/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy to clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
