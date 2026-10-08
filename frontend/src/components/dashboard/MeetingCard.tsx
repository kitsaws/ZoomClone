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
  const isActive = meeting.status === "active";
  const isEnded = meeting.status === "ended";

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/meeting/${meeting.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    onCopySuccess?.(`Copied invite link for "${meeting.topic}" to clipboard!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAction = () => {
    router.push(`/meeting/${meeting.id}`);
  };

  return (
    <div
      className={`bg-surface border border-app-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group ${className || ""}`}
    >
      {/* Left: Meeting Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-base font-bold text-text-primary group-hover:text-zoom-blue transition-colors">
            {meeting.topic}
          </h3>

          {isActive ? (
            <Badge variant="active" dot={true}>
              In Progress
            </Badge>
          ) : isEnded ? (
            <Badge variant="ended">Ended</Badge>
          ) : (
            <Badge variant="host">Scheduled</Badge>
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
        <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
          {/* Meeting ID */}
          <span className="font-mono font-medium text-text-primary">
            ID: {formatMeetingId(meeting.meeting_number)}
          </span>

          {/* Start Time / Date */}
          {meeting.scheduled_start_time ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-text-muted" />
              <span>
                {formatMeetingDate(meeting.scheduled_start_time)} at{" "}
                {formatMeetingTime(meeting.scheduled_start_time)}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-text-muted" />
              <span>Instant Call</span>
            </span>
          )}

          {/* Participant Count */}
          {meeting.participants && meeting.participants.length > 0 && (
            <span className="flex items-center gap-1 text-zoom-blue font-medium">
              <Users className="h-3.5 w-3.5" />
              <span>{meeting.participants.length} in room</span>
            </span>
          )}

          {/* Passcode flag */}
          {meeting.passcode && (
            <span className="flex items-center gap-1 text-text-muted">
              <Shield className="h-3.5 w-3.5" />
              <span>Passcode Protected</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Copy Invite Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          leftIcon={
            isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )
          }
          className="rounded-xl px-3.5"
        >
          {isCopied ? "Copied" : "Copy Link"}
        </Button>

        {/* Start / Join Button */}
        {!isEnded ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAction}
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            className="rounded-xl px-5 font-semibold"
          >
            {isHost && !isActive ? "Start Meeting" : "Join Call"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAction}
            className="rounded-xl px-4 text-text-muted"
          >
            View Summary
          </Button>
        )}
      </div>
    </div>
  );
};
