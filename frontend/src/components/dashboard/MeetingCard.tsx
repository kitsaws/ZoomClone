"use client";

import React, { useState } from "react";
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatMeetingId, formatMeetingTime, formatMeetingDate } from "@/lib/utils";
import { Copy, Check, Video, Clock, Users, ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export interface MeetingCardProps {
  meeting: Meeting;
  currentUserId?: string;
  onCopySuccess?: (msg: string) => void;
  className?: string;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentUserId,
  onCopySuccess,
  className,
}) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const isHost = currentUserId === meeting.host_id;
  const isActive = meeting.status?.toLowerCase() === "active";
  const isEnded = meeting.status?.toLowerCase() === "ended";
  const meetingTopic = meeting.topic || meeting.title || "Zoom Meeting";

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/meeting/${meeting.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    onCopySuccess?.(`Copied invite link for "${meetingTopic}" to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAction = () => {
    router.push(`/meeting/${meeting.id}`);
  };

  return (
    <div
      className={`bg-surface border border-app-border rounded-xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 group ${className || ""}`}
    >
      {/* Left: Meeting Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-text-primary group-hover:text-zoom-blue transition-colors">
            {meetingTopic}
          </h3>

          {isActive ? (
            <Badge variant="active" dot={true} size="sm">
              In Progress
            </Badge>
          ) : isEnded ? (
            <Badge variant="ended" size="sm">Ended</Badge>
          ) : (
            <Badge variant="host" size="sm">Scheduled</Badge>
          )}

          {isHost && (
            <Badge variant="coHost" size="sm">
              You are Host
            </Badge>
          )}

          {meeting.waiting_room_enabled && (
            <Badge variant="guest" size="sm" dot={true}>
              Waiting Room
            </Badge>
          )}
        </div>

        {/* Metadata Details Row */}
        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-text-secondary flex-wrap">
          {/* Meeting ID */}
          <span className="font-mono font-medium text-text-primary">
            ID: {formatMeetingId(meeting.meeting_number)}
          </span>

          {/* Start Time / Date */}
          {meeting.scheduled_start_time ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-text-muted" />
              <span>
                {formatMeetingDate(meeting.scheduled_start_time)} at{" "}
                {formatMeetingTime(meeting.scheduled_start_time)}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-text-muted" />
              <span>Instant Call</span>
            </span>
          )}

          {/* Participant Count */}
          {meeting.participants && meeting.participants.length > 0 && (
            <span className="flex items-center gap-1 text-zoom-blue font-medium">
              <Users className="h-3 w-3" />
              <span>{meeting.participants.length} in room</span>
            </span>
          )}

          {/* Passcode flag */}
          {meeting.passcode && (
            <span className="flex items-center gap-1 text-text-muted">
              <Shield className="h-3 w-3" />
              <span>Passcode Protected</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Copy Invite Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          leftIcon={
            isCopied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )
          }
          className="rounded-lg px-2.5 py-1 text-xs"
        >
          {isCopied ? "Copied" : "Copy Link"}
        </Button>

        {/* Start / Join Button */}
        {!isEnded ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAction}
            rightIcon={<ArrowRight className="h-3 w-3" />}
            className="rounded-lg px-3.5 py-1 text-xs font-semibold"
          >
            {isHost && !isActive ? "Start" : "Join"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAction}
            className="rounded-lg px-3 py-1 text-xs text-text-muted"
          >
            Summary
          </Button>
        )}
      </div>
    </div>
  );
};

