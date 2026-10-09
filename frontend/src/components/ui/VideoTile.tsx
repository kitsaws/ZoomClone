"use client";

import React, { useRef, useEffect } from "react";
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
  videoTrack?: any;
  reactions?: string[];
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

  return (
    <div
      className={cn(
        "relative w-full aspect-video bg-[#12121A] rounded-2xl overflow-hidden border transition-all duration-200 flex items-center justify-center select-none shadow-lg",
        isSpeaking
          ? "border-emerald-500 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(40,167,69,0.3)]"
          : "border-[#2C2C3E] hover:border-[#36364A]",
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
        <div className="w-full h-full bg-[#161622] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(45,140,255,0.08),transparent_70%)]" />
          <Avatar name={name} src={avatarUrl} size="xl" />
        </div>
      )}

      {/* Top Left: Pin Indicator */}
      {isPinned && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg p-1.5 text-white border border-white/10">
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

      {/* Floating Reactions Overlay */}
      {reactions.length > 0 && (
        <div className="absolute bottom-12 right-4 flex flex-col gap-1.5 pointer-events-none z-20">
          {reactions.map((emoji, i) => (
            <div
              key={i}
              className="text-2xl sm:text-3xl animate-bounce drop-shadow-md bg-black/40 backdrop-blur-sm rounded-full p-1.5 border border-white/10 flex items-center justify-center"
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Info Bar: Name & Mic Status */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 max-w-[80%]">
          <span className="text-xs font-semibold text-white truncate">
            {isSelf && !name.toLowerCase().includes("(you)") && name !== "You"
              ? `${name} (You)`
              : name}
          </span>
          {isHost && (
            <span className="text-[10px] bg-zoom-blue text-white font-bold px-1.5 py-0.2 rounded shrink-0">
              Host
            </span>
          )}
        </div>

        {/* Audio Status Icon */}
        <div
          className={cn(
            "p-1.5 rounded-lg backdrop-blur-md border border-white/10",
            isAudioMuted
              ? "bg-rose-600 text-white"
              : isSpeaking
              ? "bg-emerald-500 text-white animate-pulse"
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
