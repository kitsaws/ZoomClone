"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  X,
  Image as ImageIcon,
  ChevronDown,
  Info,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MeetingLobbyModalProps {
  meetingTitle: string;
  initialName?: string;
  isHost?: boolean;
  onJoin: (options: {
    displayName: string;
    audioMuted: boolean;
    videoOff: boolean;
  }) => void;
  onCancel: () => void;
}

export const MeetingLobbyModal: React.FC<MeetingLobbyModalProps> = ({
  meetingTitle,
  initialName = "",
  isHost = false,
  onJoin,
  onCancel,
}) => {
  const [displayName, setDisplayName] = useState(
    initialName ||
      (typeof window !== "undefined"
        ? localStorage.getItem("zoom_saved_name") || ""
        : "")
  );
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [alwaysShowPreview, setAlwaysShowPreview] = useState(true);

  // Local media stream preview
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Device lists
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function setupPreviewStream() {
      try {
        if (!isVideoOff) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: !isAudioMuted,
          });
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        }

        // List devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (active) {
          const audioInputs = devices.filter((d) => d.kind === "audioinput");
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          setAudioDevices(audioInputs);
          setVideoDevices(videoInputs);
          if (audioInputs.length > 0 && !selectedAudioId) {
            setSelectedAudioId(audioInputs[0].deviceId);
          }
          if (videoInputs.length > 0 && !selectedVideoId) {
            setSelectedVideoId(videoInputs[0].deviceId);
          }
        }
      } catch (err) {
        console.warn("Lobby media preview note:", err);
      }
    }

    setupPreviewStream();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isVideoOff, isAudioMuted]);

  const handleStartJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = displayName.trim() || (isHost ? "Host" : "Guest User");
    if (typeof window !== "undefined") {
      localStorage.setItem("zoom_saved_name", finalName);
    }
    // Stop preview stream before room takes over
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onJoin({
      displayName: finalName,
      audioMuted: isAudioMuted,
      videoOff: isVideoOff,
    });
  };

  const initialChar = (displayName.trim()[0] || (isHost ? "H" : "G")).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      {/* Zoom Lobby Window Box (Light Themed) */}
      <div className="w-full max-w-2xl bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-900 font-sans">
        {/* Title Bar */}
        <div className="px-4 py-2.5 bg-[#EBEFF2] border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zoom-blue text-white text-[10px] font-bold rounded flex items-center justify-center shadow-xs">
              zm
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#1F2429] truncate max-w-md">
              {meetingTitle || "Zoom Meeting"}
            </span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-black/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Preview Canvas */}
        <div className="p-3 sm:p-4 bg-zinc-900 flex flex-col items-center">
          <div className="relative w-full aspect-video max-h-[320px] bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
            {!isVideoOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              /* Avatar placeholder (Screenshot: rust/orange square with large initial) */
              <div className="w-full h-full bg-[#B83E1C] flex items-center justify-center">
                <span className="text-7xl sm:text-8xl font-light text-white select-none">
                  {initialChar}
                </span>
              </div>
            )}

            {/* In-Canvas Floating Controls Pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#181824]/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-xl shadow-lg text-white">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors cursor-pointer min-w-[54px]",
                  isAudioMuted
                    ? "text-rose-500 hover:bg-rose-500/10"
                    : "text-zinc-100 hover:bg-white/10"
                )}
                title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isAudioMuted ? (
                  <MicOff className="h-4 w-4 text-rose-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="text-[10px] font-medium mt-0.5">Audio</span>
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors cursor-pointer min-w-[54px]",
                  isVideoOff
                    ? "text-rose-500 hover:bg-rose-500/10"
                    : "text-zinc-100 hover:bg-white/10"
                )}
                title={isVideoOff ? "Start Video" : "Stop Video"}
              >
                {isVideoOff ? (
                  <VideoOff className="h-4 w-4 text-rose-500" />
                ) : (
                  <VideoIcon className="h-4 w-4" />
                )}
                <span className="text-[10px] font-medium mt-0.5">Video</span>
              </button>

              {/* Backgrounds Button */}
              <button
                type="button"
                onClick={() => alert("Virtual backgrounds will be available inside the room")}
                className="flex items-center gap-1 px-2.5 py-1 text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs font-medium cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Backgrounds</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Controls: Device Selectors & Display Name */}
        <form onSubmit={handleStartJoin} className="p-4 sm:p-5 space-y-3.5 bg-white">
          {/* Device dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Audio device selector */}
            <div className="relative">
              <div className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-zinc-800 shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <Mic className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">
                    {audioDevices.find((d) => d.deviceId === selectedAudioId)?.label ||
                      "Custom combination"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-1" />
              </div>
            </div>

            {/* Video device selector */}
            <div className="relative">
              <div className="w-full bg-[#F8FAFC] border border-zinc-300 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-zinc-800 shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <VideoIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">
                    {videoDevices.find((d) => d.deviceId === selectedVideoId)?.label ||
                      "Integrated Camera"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-1" />
              </div>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <div className="relative">
              <UserIcon className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white border border-zinc-300 focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue/20 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-colors shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Bottom Action Footer (Screenshot 3) */}
          <div className="pt-3 flex items-center justify-between border-t border-zinc-200">
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={alwaysShowPreview}
                onChange={(e) => setAlwaysShowPreview(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer accent-zoom-blue"
              />
              <span>Always show this preview when joining</span>
              <Info className="h-3.5 w-3.5 text-zinc-400" />
            </label>

            <button
              type="submit"
              className="bg-zoom-blue hover:bg-zoom-blue-hover text-white px-8 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-zoom-blue/25 transition-all cursor-pointer"
            >
              {isHost ? "Start" : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
