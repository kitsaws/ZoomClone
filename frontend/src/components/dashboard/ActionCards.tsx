"use client";

import React from "react";
import { ActionCard } from "@/components/ui/ActionCard";
import { HostIcon, JoinIcon, ScheduleIcon, ShareIcon } from "@/components/icons/ZoomIcons";

export interface ActionCardsProps {
  onNewMeeting: () => void;
  onJoin: () => void;
  onSchedule: () => void;
  onShareScreen: () => void;
  className?: string;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  onNewMeeting,
  onJoin,
  onSchedule,
  onShareScreen,
  className,
}) => {
  return (
    <div className={className}>
      <div className="bg-surface border border-app-border rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-around flex-wrap gap-4 transition-colors">
        <ActionCard
          title="New Meeting"
          variant="orange"
          hasDropdown={true}
          icon={<HostIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
          onClick={onNewMeeting}
        />
        <ActionCard
          title="Join"
          variant="blue"
          icon={<JoinIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
          onClick={onJoin}
        />
        <ActionCard
          title="Schedule"
          variant="blue"
          icon={<ScheduleIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
          onClick={onSchedule}
        />
        <ActionCard
          title="Share Screen"
          variant="blue"
          icon={<ShareIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
          onClick={onShareScreen}
        />
      </div>
    </div>
  );
};

