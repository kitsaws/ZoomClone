"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Shield,
  Users,
  MessageSquare,
  Share2,
  Smile,
  LogOut,
  ChevronUp,
} from "lucide-react";

export interface ControlBarProps {
  isMuted?: boolean;
  isVideoMuted?: boolean;
  participantCount?: number;
  unreadChatCount?: number;
  isHost?: boolean;
  onToggleMic?: () => void;
  onToggleVideo?: () => void;
  onOpenParticipants?: () => void;
  onOpenChat?: () => void;
  onShareScreen?: () => void;
  onEndMeeting?: () => void;
  className?: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted: initialMuted = false,
  isVideoMuted: initialVideoMuted = false,
  participantCount = 4,
  unreadChatCount = 0,
  isHost = true,
  onToggleMic,
  onToggleVideo,
  onOpenParticipants,
  onOpenChat,
  onShareScreen,
  onEndMeeting,
  className,
}) => {
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isVideoMuted, setIsVideoMuted] = useState(initialVideoMuted);

  const handleMicClick = () => {
    setIsMuted(!isMuted);
    onToggleMic?.();
  };

  const handleVideoClick = () => {
    setIsVideoMuted(!isVideoMuted);
    onToggleVideo?.();
  };

  return (
    <div
      className={cn(
        "w-full bg-[#1A1A24]/95 backdrop-blur-md border-t border-zoom-border/80 px-4 py-3 flex items-center justify-between shadow-2xl select-none",
        className
      )}
    >
      {/* Left Section: Audio & Video controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mic Control */}
        <div className="flex items-center bg-zoom-card-surface/70 hover:bg-zoom-card-hover rounded-xl p-0.5 border border-zoom-border/50 transition-colors">
          <button
            onClick={handleMicClick}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isMuted ? "text-zoom-danger" : "text-zoom-white hover:text-white"
            )}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5 mb-0.5" />
            ) : (
              <Mic className="h-5 w-5 mb-0.5 text-zoom-success" />
            )}
            <span className="text-[11px]">{isMuted ? "Unmute" : "Mute"}</span>
          </button>
          <button className="px-1 py-3 text-zoom-muted-text hover:text-zoom-white transition-colors border-l border-white/10">
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>

        {/* Video Control */}
        <div className="flex items-center bg-zoom-card-surface/70 hover:bg-zoom-card-hover rounded-xl p-0.5 border border-zoom-border/50 transition-colors">
          <button
            onClick={handleVideoClick}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isVideoMuted ? "text-zoom-danger" : "text-zoom-white hover:text-white"
            )}
            title={isVideoMuted ? "Start Video" : "Stop Video"}
          >
            {isVideoMuted ? (
              <VideoOff className="h-5 w-5 mb-0.5" />
            ) : (
              <Video className="h-5 w-5 mb-0.5" />
            )}
            <span className="text-[11px]">{isVideoMuted ? "Start Video" : "Stop Video"}</span>
          </button>
          <button className="px-1 py-3 text-zoom-muted-text hover:text-zoom-white transition-colors border-l border-white/10">
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Center Section: Meeting Collaboration Tools */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Security */}
        {isHost && (
          <button className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-zoom-white hover:bg-zoom-card-surface/70 transition-colors text-xs">
            <Shield className="h-5 w-5 mb-0.5 text-zoom-blue" />
            <span className="text-[11px] hidden sm:inline">Security</span>
          </button>
        )}

        {/* Participants */}
        <button
          onClick={onOpenParticipants}
          className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-zoom-white hover:bg-zoom-card-surface/70 transition-colors text-xs"
        >
          <div className="relative">
            <Users className="h-5 w-5 mb-0.5 text-zoom-white" />
            <span className="absolute -top-1 -right-2 bg-zoom-blue text-white text-[9px] font-bold px-1 rounded-full">
              {participantCount}
            </span>
          </div>
          <span className="text-[11px] hidden sm:inline">Participants</span>
        </button>

        {/* Chat */}
        <button
          onClick={onOpenChat}
          className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-zoom-white hover:bg-zoom-card-surface/70 transition-colors text-xs"
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5 mb-0.5 text-zoom-white" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-zoom-orange text-white text-[9px] font-bold px-1 rounded-full">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[11px] hidden sm:inline">Chat</span>
        </button>

        {/* Share Screen */}
        <button
          onClick={onShareScreen}
          className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-emerald-400 hover:bg-zoom-card-surface/70 transition-colors text-xs"
        >
          <Share2 className="h-5 w-5 mb-0.5" />
          <span className="text-[11px] hidden sm:inline text-zoom-white font-medium">
            Share Screen
          </span>
        </button>

        {/* Reactions */}
        <button className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-zoom-white hover:bg-zoom-card-surface/70 transition-colors text-xs">
          <Smile className="h-5 w-5 mb-0.5 text-yellow-400" />
          <span className="text-[11px] hidden sm:inline">Reactions</span>
        </button>
      </div>

      {/* Right Section: End / Leave Button */}
      <div className="flex items-center">
        <button
          onClick={onEndMeeting}
          className="bg-zoom-danger hover:bg-zoom-danger-hover text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_2px_8px_rgba(224,40,40,0.3)] hover:shadow-[0_4px_12px_rgba(224,40,40,0.4)] transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          <span>{isHost ? "End" : "Leave"}</span>
        </button>
      </div>
    </div>
  );
};
