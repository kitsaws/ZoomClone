"use client";

import React from "react";
import { ActionCard } from "@/components/ui/ActionCard";
import { HostIcon, JoinIcon, ScheduleIcon, ShareIcon, NotesIcon } from "@/components/icons/ZoomIcons";
import { cn } from "@/lib/utils";

export interface ActionCardsProps {
  onNewMeeting: () => void;
  onJoin: () => void;
  onSchedule: () => void;
  onShareScreen: () => void;
  onMyNotes?: () => void;
  className?: string;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  onNewMeeting,
  onJoin,
  onSchedule,
  onShareScreen,
  onMyNotes,
  className,
}) => {
  return (
    <div className={cn("w-full flex items-center justify-between select-none py-2 px-2 sm:px-4", className)}>
      <ActionCard
        title="New meeting"
        variant="orange"
        hasDropdown={true}
        icon={<HostIcon className="h-6 w-6 sm:h-7 sm:w-7" />}
        onClick={onNewMeeting}
      />
      <ActionCard
        title="Join"
        variant="blue"
        icon={<JoinIcon className="h-6 w-6 sm:h-7 sm:w-7" />}
        onClick={onJoin}
      />
      <ActionCard
        title="Schedule"
        variant="blue"
        icon={<ScheduleIcon className="h-6 w-6 sm:h-7 sm:w-7" />}
        onClick={onSchedule}
      />
      <ActionCard
        title="Share screen"
        variant="blue"
        icon={<ShareIcon className="h-6 w-6 sm:h-7 sm:w-7" />}
        onClick={onShareScreen}
      />
      <ActionCard
        title="My Notes"
        variant="blue"
        icon={<NotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
        onClick={onMyNotes || (() => alert("Zoom Notes feature"))}
      />
    </div>
  );
};
