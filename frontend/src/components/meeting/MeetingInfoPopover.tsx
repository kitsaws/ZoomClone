"use client";

import React, { useState } from "react";
import { Meeting, MeetingParticipant } from "@/types/meeting";
import { formatMeetingId } from "@/lib/utils";
import { Copy, Check, ShieldCheck, Wrench, X } from "lucide-react";

export interface MeetingInfoPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  localParticipant: MeetingParticipant | null;
  isHost: boolean;
  onOpenHostTools: () => void;
}

export const MeetingInfoPopover: React.FC<MeetingInfoPopoverProps> = ({
  isOpen,
  onClose,
  meeting,
  localParticipant,
  isHost,
  onOpenHostTools,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const meetingUrl = typeof window !== "undefined" ? `${window.location.origin}/meeting/${meeting.id}` : "";
  const hostName = (meeting as any).host?.display_name || "Swastik Nagpal";
  const displayHost = isHost ? `${hostName} (You)` : hostName;
  const participantId = localParticipant?.id ? localParticipant.id.replace(/\D/g, "").slice(0, 6) || "482910" : "482910";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Backdrop to close on outer click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Card */}
      <div className="absolute top-14 left-5 z-50 w-96 bg-surface border border-app-border rounded-2xl shadow-2xl p-5 text-text-primary animate-in fade-in zoom-in-95 duration-150 select-text">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-app-border gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <h3 className="font-bold text-sm tracking-tight truncate max-w-[280px]">
              {meeting.topic || meeting.title || `${hostName}'s Zoom Meeting`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formatted Information Table */}
        <div className="py-3">
          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-app-border/40">
                <td className="py-2 pr-3 font-semibold text-text-muted w-28 whitespace-nowrap">
                  Meeting ID:
                </td>
                <td className="py-2 font-mono font-medium text-text-primary select-all">
                  {formatMeetingId(meeting.meeting_number)}
                </td>
              </tr>

              <tr className="border-b border-app-border/40">
                <td className="py-2 pr-3 font-semibold text-text-muted">Host:</td>
                <td className="py-2 text-text-primary font-medium select-all">
                  {displayHost}
                </td>
              </tr>

              <tr className="border-b border-app-border/40">
                <td className="py-2 pr-3 font-semibold text-text-muted">Passcode:</td>
                <td className="py-2 font-mono text-text-primary font-medium select-all">
                  {meeting.passcode || "None"}
                </td>
              </tr>

              <tr className="border-b border-app-border/40">
                <td className="py-2 pr-3 font-semibold text-text-muted">Participant ID:</td>
                <td className="py-2 font-mono text-text-primary font-medium select-all">
                  {participantId}
                </td>
              </tr>

              <tr>
                <td className="py-2 pr-3 font-semibold text-text-muted align-top pt-2.5">
                  Invite Link:
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={meetingUrl}
                      className="w-full bg-surface-subtle border border-app-border rounded-lg px-2.5 py-1 text-[11px] text-text-secondary select-all font-mono focus:outline-none focus:border-zoom-blue"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg bg-zoom-blue hover:bg-zoom-blue-hover text-white transition-colors shrink-0 shadow-sm cursor-pointer"
                      title="Copy Invite Link"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer: Borderless "Host Tools" Button */}
        <div className="pt-3 border-t border-app-border flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenHostTools();
            }}
            className="text-xs font-semibold text-zoom-blue hover:text-zoom-blue-hover flex items-center gap-1.5 hover:underline transition-all cursor-pointer border-none bg-transparent p-0"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Host Tools</span>
          </button>

          <span className="text-[10px] text-text-muted">
            End-to-end Encrypted
          </span>
        </div>
      </div>
    </>
  );
};
