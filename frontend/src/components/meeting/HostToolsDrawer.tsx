"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Wrench,
  X,
  Lock,
  Users,
  Share2,
  MessageSquare,
  MicOff,
  VolumeX,
  LogOut,
  Shield,
  CheckCircle2,
} from "lucide-react";

export interface HostToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  onMuteAll: () => void;
  onEndMeetingForAll: () => void;
}

export const HostToolsDrawer: React.FC<HostToolsDrawerProps> = ({
  isOpen,
  onClose,
  isHost,
  onMuteAll,
  onEndMeetingForAll,
}) => {
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [isWaitingRoomActive, setIsWaitingRoomActive] = useState(false);
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowUnmute, setAllowUnmute] = useState(true);
  const [muteAllToast, setMuteAllToast] = useState(false);

  if (!isOpen) return null;

  const handleMuteAll = () => {
    onMuteAll();
    setMuteAllToast(true);
    setTimeout(() => setMuteAllToast(false), 2500);
  };

  return (
    <aside className="w-80 sm:w-96 bg-[#1B1B26] border-l border-[#2C2C3E] flex flex-col justify-between shrink-0 z-40 animate-in slide-in-from-right duration-200 text-white select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C3E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-4.5 w-4.5 text-zoom-blue" />
          <h3 className="text-sm font-bold text-zinc-100">Host Tools &amp; Controls</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#2C2C3E] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {muteAllToast && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 flex items-center gap-2.5 text-xs animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>All participants have been muted.</span>
          </div>
        )}

        {/* Security Controls */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-zoom-blue" />
            <span>Room Security</span>
          </span>

          <div className="bg-[#232333] border border-[#36364A] rounded-xl p-3.5 space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Lock Meeting</span>
              </span>
              <input
                type="checkbox"
                checked={isMeetingLocked}
                onChange={(e) => setIsMeetingLocked(e.target.checked)}
                className="h-4 w-4 rounded bg-[#1A1A24] border-[#36364A] text-zoom-blue focus:ring-zoom-blue"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                <span>Enable Waiting Room</span>
              </span>
              <input
                type="checkbox"
                checked={isWaitingRoomActive}
                onChange={(e) => setIsWaitingRoomActive(e.target.checked)}
                className="h-4 w-4 rounded bg-[#1A1A24] border-[#36364A] text-zoom-blue focus:ring-zoom-blue"
              />
            </label>
          </div>
        </div>

        {/* Participant Permissions */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-zoom-blue" />
            <span>Allow Participants To</span>
          </span>

          <div className="bg-[#232333] border border-[#36364A] rounded-xl p-3.5 space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>Share Screen</span>
              </span>
              <input
                type="checkbox"
                checked={allowScreenShare}
                onChange={(e) => setAllowScreenShare(e.target.checked)}
                className="h-4 w-4 rounded bg-[#1A1A24] border-[#36364A] text-zoom-blue focus:ring-zoom-blue"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                <span>Chat with Everyone</span>
              </span>
              <input
                type="checkbox"
                checked={allowChat}
                onChange={(e) => setAllowChat(e.target.checked)}
                className="h-4 w-4 rounded bg-[#1A1A24] border-[#36364A] text-zoom-blue focus:ring-zoom-blue"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <MicOff className="h-3.5 w-3.5 text-zinc-400" />
                <span>Unmute Themselves</span>
              </span>
              <input
                type="checkbox"
                checked={allowUnmute}
                onChange={(e) => setAllowUnmute(e.target.checked)}
                className="h-4 w-4 rounded bg-[#1A1A24] border-[#36364A] text-zoom-blue focus:ring-zoom-blue"
              />
            </label>
          </div>
        </div>

        {/* Global Host Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMuteAll}
            leftIcon={<VolumeX className="h-4 w-4 text-zoom-danger" />}
            className="w-full rounded-xl bg-[#232333] border-[#36364A] text-zinc-200 hover:bg-[#2C2C3E] py-2.5 font-semibold text-xs justify-center"
          >
            Mute All Participants
          </Button>

          {isHost && (
            <Button
              variant="danger"
              size="sm"
              onClick={onEndMeetingForAll}
              leftIcon={<LogOut className="h-4 w-4" />}
              className="w-full rounded-xl py-2.5 font-semibold text-xs justify-center"
            >
              End Meeting for All
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
