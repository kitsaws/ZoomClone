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
      <div className="bg-surface border border-app-border rounded-3xl p-6 sm:p-10 shadow-sm flex items-center justify-around flex-wrap gap-6 transition-colors">
        <ActionCard
          title="New Meeting"
          variant="orange"
          hasDropdown={true}
          icon={<HostIcon className="h-10 w-10 sm:h-12 sm:w-12" />}
          onClick={onNewMeeting}
        />
        <ActionCard
          title="Join"
          variant="blue"
          icon={<JoinIcon className="h-10 w-10 sm:h-12 sm:w-12" />}
          onClick={onJoin}
        />
        <ActionCard
          title="Schedule"
          variant="blue"
          icon={<ScheduleIcon className="h-10 w-10 sm:h-12 sm:w-12" />}
          onClick={onSchedule}
        />
        <ActionCard
          title="Share Screen"
          variant="blue"
          icon={<ShareIcon className="h-10 w-10 sm:h-12 sm:w-12" />}
          onClick={onShareScreen}
        />
      </div>
    </div>
  );
};
