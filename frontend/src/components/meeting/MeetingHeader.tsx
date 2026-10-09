"use client";

import React, { useState } from "react";
import { Meeting, MeetingParticipant } from "@/types/meeting";
import { ViewMode } from "@/hooks/useMeetingRoom";
import { MeetingInfoPopover } from "./MeetingInfoPopover";
import {
  Video,
  Info,
  ChevronDown,
  Clock,
  User,
  LayoutGrid,
  Grid3X3,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MeetingHeaderProps {
  meeting: Meeting;
  localParticipant: MeetingParticipant | null;
  isHost: boolean;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  elapsedSeconds: number;
  isInfoPopoverOpen: boolean;
  onToggleInfoPopover: () => void;
  onOpenHostTools: () => void;
  className?: string;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meeting,
  localParticipant,
  isHost,
  viewMode,
  onSelectViewMode,
  elapsedSeconds,
  isInfoPopoverOpen,
  onToggleInfoPopover,
  onOpenHostTools,
  className,
}) => {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  // Format timer MM:SS or HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const hostName = (meeting as any).host?.display_name || "Host";
  const titleText = meeting.topic || meeting.title || `${hostName}'s Zoom Meeting`;

  return (
    <header
      className={cn(
        "h-12 bg-[#181820]/95 backdrop-blur-md border-b border-[#2C2C3E] px-4 flex items-center justify-between shrink-0 z-30 select-none relative",
        className
      )}
    >
      {/* Left Section: Logo & Info Pill */}
      <div className="flex items-center gap-3">
        {/* Leftmost: Zoom Workplace Brand */}
        <div className="flex items-center gap-1.5 cursor-default">
          <div className="h-6 w-6 bg-zoom-blue text-white rounded-lg flex items-center justify-center shadow-sm">
            <Video className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-black tracking-tight text-white font-wordmark hidden sm:inline">
            zoom
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-[#36364A]" />

        {/* Info Pill Trigger */}
        <button
          onClick={onToggleInfoPopover}
          className={cn(
            "flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border",
            isInfoPopoverOpen
              ? "bg-zoom-blue text-white border-zoom-blue shadow-sm"
              : "bg-[#232333] hover:bg-[#2C2C3E] border-[#36364A] text-zinc-200"
          )}
          title="Click to view Meeting ID, Passcode & Link"
        >
          <Info className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate max-w-[160px] sm:max-w-xs">{titleText}</span>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>
      </div>

      {/* Popover Mounted Right Below */}
      <MeetingInfoPopover
        isOpen={isInfoPopoverOpen}
        onClose={onToggleInfoPopover}
        meeting={meeting}
        localParticipant={localParticipant}
        isHost={isHost}
        onOpenHostTools={onOpenHostTools}
      />

      {/* Center Section: Live Duration Timer */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-[#232333]/90 px-3 py-1 rounded-lg border border-[#36364A]">
        <Clock className="h-3 w-3 text-zoom-blue animate-pulse" />
        <span>{formatTimer(elapsedSeconds)}</span>
      </div>

      {/* Right Section: View Layout Switcher */}
      <div className="relative">
        <button
          onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#232333] hover:bg-[#2C2C3E] border border-[#36364A] text-zinc-200 transition-all cursor-pointer shadow-sm",
            isViewMenuOpen && "border-zoom-blue"
          )}
        >
          {viewMode === "speaker" ? (
            <User className="h-3.5 w-3.5 text-zoom-blue" />
          ) : viewMode === "dynamic" ? (
            <LayoutGrid className="h-3.5 w-3.5 text-zoom-blue" />
          ) : (
            <Grid3X3 className="h-3.5 w-3.5 text-zoom-blue" />
          )}
          <span className="capitalize hidden sm:inline">
            {viewMode === "dynamic" ? "Dynamic Gallery" : `${viewMode} View`}
          </span>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>

        {/* View Switcher Dropdown Menu */}
        {isViewMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsViewMenuOpen(false)}
            />
            <div className="absolute right-0 top-11 z-50 w-52 bg-surface border border-app-border rounded-xl shadow-2xl p-1.5 text-text-primary animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  onSelectViewMode("speaker");
                  setIsViewMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                  viewMode === "speaker"
                    ? "bg-surface-hover text-zoom-blue font-bold"
                    : "hover:bg-surface-subtle text-text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-zoom-blue" />
                  <div>
                    <p className="font-semibold">Speaker View</p>
                    <p className="text-[10px] text-text-muted">Spotlight active speaker</p>
                  </div>
                </div>
                {viewMode === "speaker" && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
              </button>

              <button
                onClick={() => {
                  onSelectViewMode("dynamic");
                  setIsViewMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                  viewMode === "dynamic"
                    ? "bg-surface-hover text-zoom-blue font-bold"
                    : "hover:bg-surface-subtle text-text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-zoom-blue" />
                  <div>
                    <p className="font-semibold">Dynamic Gallery</p>
                    <p className="text-[10px] text-text-muted">Auto-split 2-4 users</p>
                  </div>
                </div>
                {viewMode === "dynamic" && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
              </button>

              <button
                onClick={() => {
                  onSelectViewMode("gallery");
                  setIsViewMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                  viewMode === "gallery"
                    ? "bg-surface-hover text-zoom-blue font-bold"
                    : "hover:bg-surface-subtle text-text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-zoom-blue" />
                  <div>
                    <p className="font-semibold">Gallery View</p>
                    <p className="text-[10px] text-text-muted">Uniform paginated grid</p>
                  </div>
                </div>
                {viewMode === "gallery" && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
