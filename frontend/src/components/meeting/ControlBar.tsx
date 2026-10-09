"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { DrawerType } from "@/hooks/useMeetingRoom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Shield,
  Users,
  MessageSquare,
  Share2,
  Hand,
  X,
  ChevronUp,
  Heart,
  MoreHorizontal,
} from "lucide-react";

export interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  participantCount: number;
  unreadChatCount: number;
  isHost: boolean;
  activeDrawer: DrawerType;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onToggleHostTools: () => void;
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
  onSendReaction?: (emoji: string) => void;
  onOpenLeaveModal: () => void;
  className?: string;
}

const REACTION_EMOJIS = ["👏", "👍", "❤️", "😂", "😮", "🎉"];

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  isVideoOff,
  isHandRaised,
  participantCount,
  unreadChatCount,
  isHost,
  activeDrawer,
  onToggleMic,
  onToggleVideo,
  onToggleHand,
  onToggleParticipants,
  onToggleChat,
  onToggleHostTools,
  isScreenSharing = false,
  onToggleScreenShare,
  onSendReaction,
  onOpenLeaveModal,
  className,
}) => {
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setIsReactionsOpen(false);
  };

  return (
    <nav
      aria-label="Meeting Controls"
      className={cn(
        "h-18 bg-black px-4 sm:px-8 flex items-center justify-between shrink-0 z-30 select-none relative",
        className
      )}
    >
      {/* Left Section: Audio & Video Controls */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Audio Control */}
        <div className="relative flex items-center group">
          <button
            type="button"
            onClick={onToggleMic}
            className="flex flex-col items-center justify-center p-1.5 sm:px-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-zinc-200"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            <div className="relative">
              {isMuted ? (
                <MicOff className="h-5 w-5 text-rose-500 mb-0.5" />
              ) : (
                <Mic className="h-5 w-5 text-white mb-0.5" />
              )}
            </div>
            <span className="text-[11px] font-normal tracking-tight text-zinc-300">
              {isMuted ? "Unmute" : "Audio"}
            </span>
          </button>
          <button
            type="button"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer -ml-1"
            title="Audio Settings"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>

        {/* Video Control */}
        <div className="relative flex items-center group">
          <button
            type="button"
            onClick={onToggleVideo}
            className="flex flex-col items-center justify-center p-1.5 sm:px-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-zinc-200"
            title={isVideoOff ? "Start Video" : "Stop Video"}
          >
            <div className="relative">
              {isVideoOff ? (
                <VideoOff className="h-5 w-5 text-rose-500 mb-0.5" />
              ) : (
                <Video className="h-5 w-5 text-white mb-0.5" />
              )}
            </div>
            <span className="text-[11px] font-normal tracking-tight text-zinc-300">
              {isVideoOff ? "Start Video" : "Video"}
            </span>
          </button>
          <button
            type="button"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer -ml-1"
            title="Video Settings"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Center Section: Main Interaction Tools */}
      <div className="flex items-center gap-1 sm:gap-3 overflow-visible">
        {/* Participants Button */}
        <button
          type="button"
          onClick={onToggleParticipants}
          className={cn(
            "relative flex flex-col items-center justify-center p-1.5 sm:px-3 rounded-lg hover:bg-white/10 transition-colors text-zinc-300 cursor-pointer",
            activeDrawer === "participants" && "bg-white/15 text-white"
          )}
          title="Participants"
        >
          <div className="relative flex items-center justify-center">
            <Users className="h-5 w-5 text-white mb-0.5" />
            <span className="absolute -top-1 -right-2 bg-zinc-700 text-white text-[9px] font-bold px-1 rounded-full">
              {participantCount}
            </span>
          </div>
          <span className="text-[11px] font-normal tracking-tight">Participants</span>
        </button>

        {/* Chat Button */}
        <button
          type="button"
          onClick={onToggleChat}
          className={cn(
            "relative flex flex-col items-center justify-center p-1.5 sm:px-3 rounded-lg hover:bg-white/10 transition-colors text-zinc-300 cursor-pointer",
            activeDrawer === "chat" && "bg-white/15 text-white"
          )}
          title="In-Meeting Chat"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white mb-0.5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[9px] font-bold px-1 rounded-full">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-normal tracking-tight">Chat</span>
        </button>

        {/* React Popover Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsReactionsOpen(!isReactionsOpen)}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 sm:px-3 rounded-lg hover:bg-white/10 transition-colors text-zinc-300 cursor-pointer",
              (isHandRaised || isReactionsOpen) && "bg-white/15 text-white"
            )}
            title="Reactions & Hand Raise"
          >
            {isHandRaised ? (
              <Hand className="h-5 w-5 text-amber-400 mb-0.5 animate-bounce" />
            ) : (
              <Heart className="h-5 w-5 text-white mb-0.5" />
            )}
            <span className="text-[11px] font-normal tracking-tight">
              {isHandRaised ? "Hand" : "React"}
            </span>
          </button>

          {/* Reactions Floating Menu */}
          {isReactionsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsReactionsOpen(false)}
              />
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F1F2C] border border-[#36364A] rounded-2xl p-2.5 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150 min-w-[240px]">
                <div className="flex items-center justify-between gap-1 px-1">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl p-1.5 rounded-xl hover:bg-[#2C2C3E] hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onToggleHand();
                    setIsReactionsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer border",
                    isHandRaised
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                      : "bg-[#282838] text-zinc-200 border-[#36364A] hover:bg-[#323246]"
                  )}
                >
                  <Hand className="h-4 w-4 text-amber-400" />
                  <span>{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Share Screen Button */}
        <button
          type="button"
          onClick={onToggleScreenShare}
          className={cn(
            "flex flex-col items-center justify-center p-1.5 sm:px-3 rounded-lg hover:bg-white/10 transition-colors text-zinc-300 cursor-pointer",
            isScreenSharing && "bg-emerald-500/20 text-emerald-400"
          )}
          title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        >
          <Share2 className="h-5 w-5 text-emerald-400 mb-0.5" />
          <span className="text-[11px] font-normal tracking-tight text-emerald-400">
            {isScreenSharing ? "Stop Share" : "Share"}
          </span>
        </button>

        {/* Host Tools Button (if Host) */}
        {isHost && (
          <button
            type="button"
            onClick={onToggleHostTools}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 sm:px-3 rounded-lg hover:bg-white/10 transition-colors text-zinc-300 cursor-pointer",
              activeDrawer === "host-tools" && "bg-white/15 text-white"
            )}
            title="Host Security & Tools"
          >
            <Shield className="h-5 w-5 text-zoom-blue mb-0.5" />
            <span className="text-[11px] font-normal tracking-tight">Host tools</span>
          </button>
        )}

        {/* More Button */}
        <button
          type="button"
          onClick={onToggleHostTools}
          className="flex flex-col items-center justify-center p-1.5 sm:px-3 rounded-lg hover:bg-white/10 transition-colors text-zinc-300 cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="h-5 w-5 text-white mb-0.5" />
          <span className="text-[11px] font-normal tracking-tight">More</span>
        </button>
      </div>

      {/* Right Section: End Meeting Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onOpenLeaveModal}
          className="bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs sm:text-sm px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow transition-all cursor-pointer active:scale-95"
          title={isHost ? "End Meeting" : "Leave Meeting"}
        >
          <X className="h-4 w-4" />
          <span>{isHost ? "End" : "Leave"}</span>
        </button>
      </div>
    </nav>
  );
};
