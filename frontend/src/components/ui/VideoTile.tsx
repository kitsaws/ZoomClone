"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Hand, Pin, MoreHorizontal } from "lucide-react";

export interface VideoTileProps {
  name: string;
  isHost?: boolean;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  isHandRaised?: boolean;
  isPinned?: boolean;
  className?: string;
  avatarUrl?: string | null;
  videoTrack?: any;
  reactions?: string[];
  isThumbnail?: boolean;
}

// Generate consistent background color based on name
const AVATAR_COLORS = [
  "bg-amber-600",
  "bg-orange-600",
  "bg-emerald-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-rose-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const VideoTile: React.FC<VideoTileProps> = ({
  name,
  isHost = false,
  isSelf = false,
  isSpeaking = false,
  isAudioMuted = false,
  isVideoMuted = false,
  isHandRaised = false,
  isPinned = false,
  className,
  avatarUrl,
  videoTrack,
  reactions = [],
  isThumbnail = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach / Detach LiveKit Video Track
  useEffect(() => {
    const el = videoRef.current;
    if (el && videoTrack && !isVideoMuted) {
      if (typeof videoTrack.attach === "function") {
        videoTrack.attach(el);
      } else if (videoTrack instanceof MediaStreamTrack) {
        el.srcObject = new MediaStream([videoTrack]);
      }
      return () => {
        if (typeof videoTrack.detach === "function") {
          videoTrack.detach(el);
        } else if (el) {
          el.srcObject = null;
        }
      };
    }
  }, [videoTrack, isVideoMuted]);

  const showVideo = !isVideoMuted && Boolean(videoTrack);
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(name);

  return (
    <div
      className={cn(
        "relative w-full h-full bg-[#111116] rounded-xl overflow-hidden transition-all duration-150 flex items-center justify-center select-none group",
        isSpeaking
          ? "border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/50"
          : "border border-transparent",
        className
      )}
    >
      {/* Live Video Feed or Avatar Fallback */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          className={cn(
            "w-full h-full object-cover",
            isSelf && "-scale-x-100" // Mirror local selfie view
          )}
        />
      ) : (
        <div className="w-full h-full bg-[#111118] flex items-center justify-center relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className={cn(
                "rounded-2xl object-cover shadow-md",
                isThumbnail ? "w-10 h-10" : "w-18 h-18 sm:w-24 sm:h-24"
              )}
            />
          ) : (
            <div
              className={cn(
                "text-white font-bold flex items-center justify-center rounded-2xl shadow-lg",
                avatarBg,
                isThumbnail
                  ? "w-9 h-9 text-base"
                  : "w-16 h-16 sm:w-22 sm:h-22 text-2xl sm:text-3xl"
              )}
            >
              {initial}
            </div>
          )}
        </div>
      )}

      {/* Top Left: Pin Indicator */}
      {isPinned && (
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md rounded-md p-1 text-white">
          <Pin className="h-3 w-3" />
        </div>
      )}

      {/* Top Right: Hover Actions ("Mute ...") */}
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <div className="bg-black/70 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded cursor-pointer hover:bg-black/90">
          {isSelf ? "Mute" : "Ask to unmute"}
        </div>
        <div className="bg-black/70 backdrop-blur-md text-white p-1 rounded cursor-pointer hover:bg-black/90">
          <MoreHorizontal className="h-3 w-3" />
        </div>
      </div>

      {/* Top Right: Hand Raised Alert */}
      {isHandRaised && (
        <div className="absolute top-2.5 right-2.5 bg-amber-500 text-black font-bold text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md animate-bounce">
          <Hand className="h-3.5 w-3.5" />
          {!isThumbnail && <span>Hand Raised</span>}
        </div>
      )}

      {/* Floating Reactions Overlay */}
      {reactions.length > 0 && (
        <div className="absolute bottom-10 right-3 flex flex-col gap-1 pointer-events-none z-20">
          {reactions.map((emoji, i) => (
            <div
              key={i}
              className="text-2xl animate-bounce drop-shadow bg-black/40 backdrop-blur-sm rounded-full p-1 flex items-center justify-center"
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Left: Name & Mic Status Pill (Zoom style) */}
      <div className="absolute bottom-2 left-2 flex items-center pointer-events-none z-10 max-w-[90%]">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-white text-[11px] font-medium truncate">
          {/* Mic Status Icon */}
          {isAudioMuted ? (
            <MicOff className="h-3 w-3 text-rose-500 shrink-0" />
          ) : isSpeaking ? (
            <Mic className="h-3 w-3 text-emerald-400 shrink-0 animate-pulse" />
          ) : (
            <Mic className="h-3 w-3 text-white shrink-0" />
          )}

          <span className="truncate">
            {isSelf && !name.toLowerCase().includes("(you)") && name !== "You"
              ? `${name} (You)`
              : name}
          </span>

          {isHost && (
            <span className="text-[9px] bg-zoom-blue text-white px-1 py-0.2 rounded font-bold shrink-0">
              Host
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
