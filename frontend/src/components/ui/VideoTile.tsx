import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { Mic, MicOff, Hand, Pin } from "lucide-react";

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
}) => {
  return (
    <div
      className={cn(
        "relative w-full aspect-video bg-[#12121A] rounded-2xl overflow-hidden border transition-all duration-200 flex items-center justify-center select-none shadow-lg",
        isSpeaking
          ? "border-zoom-success ring-2 ring-zoom-success/50 shadow-[0_0_15px_rgba(40,167,69,0.3)]"
          : "border-zoom-border/60 hover:border-zoom-border",
        className
      )}
    >
      {/* Video Content or Avatar Fallback */}
      {!isVideoMuted ? (
        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
          {/* Simulated ambient video feed background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(45,140,255,0.08),transparent_70%)]" />
          <Avatar name={name} src={avatarUrl} size="xl" />
        </div>
      ) : (
        <div className="w-full h-full bg-[#161622] flex items-center justify-center">
          <Avatar name={name} src={avatarUrl} size="xl" />
        </div>
      )}

      {/* Top Left: Pin Indicator */}
      {isPinned && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg p-1.5 text-zoom-white border border-white/10">
          <Pin className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Top Right: Hand Raised Alert */}
      {isHandRaised && (
        <div className="absolute top-3 right-3 bg-amber-500 text-black font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md animate-bounce">
          <Hand className="h-3.5 w-3.5" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Bottom Info Bar: Name & Mic Status */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 max-w-[80%]">
          <span className="text-xs font-semibold text-zoom-white truncate">
            {name} {isSelf && "(You)"}
          </span>
          {isHost && (
            <span className="text-[10px] bg-zoom-blue/80 text-white font-bold px-1.5 py-0.2 rounded shrink-0">
              Host
            </span>
          )}
        </div>

        {/* Audio Status Icon */}
        <div
          className={cn(
            "p-1.5 rounded-lg backdrop-blur-md border border-white/10",
            isAudioMuted
              ? "bg-zoom-danger/90 text-white"
              : isSpeaking
              ? "bg-zoom-success/90 text-white animate-pulse"
              : "bg-black/60 text-white"
          )}
        >
          {isAudioMuted ? (
            <MicOff className="h-3.5 w-3.5" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    </div>
  );
};
