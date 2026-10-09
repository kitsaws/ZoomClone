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
  LogOut,
  ChevronUp,
  Smile,
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
        "h-16 bg-[#181820]/95 backdrop-blur-md border-t border-[#2C2C3E] px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none relative",
        className
      )}
    >
      {/* Left Section: Audio & Video Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mic Control */}
        <div className="flex items-center bg-[#232333] hover:bg-[#2C2C3E] rounded-xl p-0.5 border border-[#36364A] transition-colors shadow-sm">
          <button
            type="button"
            onClick={onToggleMic}
            className={cn(
              "flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              isMuted ? "text-rose-500" : "text-zinc-200 hover:text-white"
            )}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <MicOff className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-rose-500" />
            ) : (
              <Mic className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-emerald-400" />
            )}
            <span className="text-[10px] sm:text-[11px] font-medium">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>
          <button
            type="button"
            className="px-1 py-2 text-zinc-400 hover:text-zinc-200 transition-colors border-l border-[#36364A] cursor-pointer"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>

        {/* Video Control */}
        <div className="flex items-center bg-[#232333] hover:bg-[#2C2C3E] rounded-xl p-0.5 border border-[#36364A] transition-colors shadow-sm">
          <button
            type="button"
            onClick={onToggleVideo}
            className={cn(
              "flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              isVideoOff ? "text-rose-500" : "text-zinc-200 hover:text-white"
            )}
            title={isVideoOff ? "Start Video" : "Stop Video"}
          >
            {isVideoOff ? (
              <VideoOff className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-rose-500" />
            ) : (
              <Video className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-zinc-200" />
            )}
            <span className="text-[10px] sm:text-[11px] font-medium">
              {isVideoOff ? "Start Video" : "Stop Video"}
            </span>
          </button>
          <button
            type="button"
            className="px-1 py-2 text-zinc-400 hover:text-zinc-200 transition-colors border-l border-[#36364A] cursor-pointer"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Center Section: Collaboration Controls */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-visible">
        {/* Host Security / Tools (if Host) */}
        {isHost && (
          <button
            type="button"
            onClick={onToggleHostTools}
            className={cn(
              "flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-xl text-zinc-300 hover:bg-[#232333] transition-colors text-xs cursor-pointer border border-transparent",
              activeDrawer === "host-tools" && "bg-[#232333] text-zoom-blue border-[#36364A]"
            )}
            title="Host Security & Controls"
          >
            <Shield className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-zoom-blue" />
            <span className="text-[10px] sm:text-[11px] hidden md:inline">Security</span>
          </button>
        )}

        {/* Participants Button */}
        <button
          type="button"
          onClick={onToggleParticipants}
          className={cn(
            "relative flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-xl text-zinc-300 hover:bg-[#232333] transition-colors text-xs cursor-pointer border border-transparent",
            activeDrawer === "participants" && "bg-[#232333] text-zoom-blue border-[#36364A]"
          )}
          title="Participants"
        >
          <div className="relative">
            <Users className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5" />
            <span className="absolute -top-1 -right-2 bg-zoom-blue text-white text-[9px] font-bold px-1 rounded-full shadow-sm">
              {participantCount}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] hidden md:inline">Participants</span>
        </button>

        {/* Chat Button */}
        <button
          type="button"
          onClick={onToggleChat}
          className={cn(
            "relative flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-xl text-zinc-300 hover:bg-[#232333] transition-colors text-xs cursor-pointer border border-transparent",
            activeDrawer === "chat" && "bg-[#232333] text-zoom-blue border-[#36364A]"
          )}
          title="In-Meeting Chat"
        >
          <div className="relative">
            <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[9px] font-bold px-1 rounded-full shadow-sm">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] hidden md:inline">Chat</span>
        </button>

        {/* Share Screen */}
        <button
          type="button"
          onClick={onToggleScreenShare}
          className={cn(
            "flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-xl transition-colors text-xs cursor-pointer border border-transparent",
            isScreenSharing
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "text-emerald-400 hover:bg-[#232333]"
          )}
          title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        >
          <Share2 className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] hidden md:inline text-zinc-200 font-medium">
            {isScreenSharing ? "Stop Share" : "Share Screen"}
          </span>
        </button>

        {/* Reactions Popover Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsReactionsOpen(!isReactionsOpen)}
            className={cn(
              "flex flex-col items-center justify-center px-2.5 sm:px-3 py-1 rounded-xl transition-colors text-xs cursor-pointer border border-transparent",
              isHandRaised
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : isReactionsOpen
                ? "bg-[#232333] text-zoom-blue border-[#36364A]"
                : "text-zinc-300 hover:bg-[#232333]"
            )}
            title="Reactions & Hand Raise"
          >
            {isHandRaised ? (
              <Hand className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-amber-400 animate-bounce" />
            ) : (
              <Smile className="h-4 sm:h-5 w-4 sm:w-5 mb-0.5 text-amber-400" />
            )}
            <span className="text-[10px] sm:text-[11px] hidden md:inline">
              {isHandRaised ? "Hand Raised" : "Reactions"}
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
                {/* Quick Emoji Bar */}
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

                {/* Raise / Lower Hand Toggle */}
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
      </div>

      {/* Right Section: End / Leave Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onOpenLeaveModal}
          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 shadow-[0_2px_8px_rgba(224,40,40,0.3)] hover:shadow-[0_4px_12px_rgba(224,40,40,0.4)] transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span>{isHost ? "End" : "Leave"}</span>
        </button>
      </div>
    </nav>
  );
};
