"use client";

import React, { useState } from "react";
import { MeetingParticipant } from "@/types/meeting";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  VolumeX,
  Copy,
  Check,
  X,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ParticipantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participants: MeetingParticipant[];
  localParticipant: MeetingParticipant | null;
  isHost: boolean;
  meetingId: string;
  onMuteAll: () => void;
  className?: string;
}

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  localParticipant,
  isHost,
  meetingId,
  onMuteAll,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter participants
  const filteredParticipants = participants.filter((p) =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyInvite = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside
      className={cn(
        "w-80 sm:w-88 bg-[#1B1B26] border-l border-[#2C2C3E] flex flex-col justify-between shrink-0 z-30 select-none animate-in slide-in-from-right duration-200 shadow-2xl",
        className
      )}
    >
      {/* 1. Header */}
      <div className="p-3.5 border-b border-[#2C2C3E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zoom-blue" />
          <h3 className="text-xs font-bold text-zinc-100 tracking-tight">
            Participants ({participants.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#2C2C3E] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Participants Drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Search Box */}
      <div className="p-3 border-b border-[#2C2C3E]/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#232333] border border-[#36364A] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zoom-blue transition-colors"
          />
        </div>
      </div>

      {/* 3. Participant List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs">
            No participants found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredParticipants.map((p) => {
            const isSelf = p.id === localParticipant?.id;
            const isPartHost = p.role?.toUpperCase() === "HOST";
            const isAudioMuted = p.audio_muted ?? p.is_audio_muted ?? true;
            const isVideoMuted = p.video_muted ?? p.is_video_off ?? false;
            const isHandRaised = p.hand_raised ?? p.is_hand_raised ?? false;

            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                  isSelf
                    ? "bg-[#232333] border-zoom-blue/40"
                    : "bg-[#232333]/60 border-[#36364A] hover:bg-[#232333]"
                )}
              >
                {/* User Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={p.display_name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-100 truncate">
                        {p.display_name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          (You)
                        </span>
                      )}
                      {isPartHost && (
                        <span className="text-[9px] bg-zoom-blue/20 text-zoom-blue font-bold px-1.5 py-0.5 rounded border border-zoom-blue/30">
                          Host
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges & Icons */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isHandRaised && (
                    <div
                      className="p-1 rounded-md bg-amber-500/20 text-amber-400"
                      title="Hand Raised"
                    >
                      <Hand className="h-3 w-3 animate-bounce" />
                    </div>
                  )}

                  {/* Audio Status */}
                  <div
                    className={cn(
                      "p-1 rounded-md",
                      isAudioMuted
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    )}
                    title={isAudioMuted ? "Muted" : "Unmuted"}
                  >
                    {isAudioMuted ? (
                      <MicOff className="h-3 w-3" />
                    ) : (
                      <Mic className="h-3 w-3" />
                    )}
                  </div>

                  {/* Video Status */}
                  <div
                    className={cn(
                      "p-1 rounded-md",
                      isVideoMuted
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-zinc-700/50 text-zinc-300"
                    )}
                    title={isVideoMuted ? "Video Stopped" : "Video On"}
                  >
                    {isVideoMuted ? (
                      <VideoOff className="h-3 w-3" />
                    ) : (
                      <Video className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer Action Buttons */}
      <div className="p-3 border-t border-[#2C2C3E] bg-[#161622] space-y-2">
        <div className="flex items-center gap-2">
          {/* Host Mute All */}
          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMuteAll}
              leftIcon={<VolumeX className="h-3.5 w-3.5 text-rose-400" />}
              className="flex-1 rounded-xl text-xs bg-[#232333] border-[#36364A] text-zinc-200 hover:bg-[#2C2C3E]"
            >
              Mute All
            </Button>
          )}

          {/* Copy Invite Link */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyInvite}
            leftIcon={
              copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )
            }
            className="flex-1 rounded-xl text-xs"
          >
            {copied ? "Link Copied!" : "Invite Link"}
          </Button>
        </div>
      </div>
    </aside>
  );
};
