"use client";

import React from "react";
import { LogOut, X, AlertTriangle } from "lucide-react";

export interface LeaveMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  onLeave: () => void;
  onEndForAll: () => void;
}

export const LeaveMeetingModal: React.FC<LeaveMeetingModalProps> = ({
  isOpen,
  onClose,
  isHost,
  onLeave,
  onEndForAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#1B1B26] border border-[#2C2C3E] rounded-2xl w-full max-w-sm p-5 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in-95 duration-150 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C2C3E]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <LogOut className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm">
              {isHost ? "End or Leave Meeting?" : "Leave Meeting?"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#2C2C3E] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="py-4 text-xs text-zinc-300 leading-relaxed">
          {isHost
            ? "As the host, you can end the meeting for all attendees, or leave."
            : "Are you sure you want to leave this meeting? You can rejoin using the invite link."}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {isHost && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEndForAll();
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-rose-600/30 flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>End Meeting for All</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onLeave();
            }}
            className={
              isHost
                ? "w-full bg-[#232333] hover:bg-[#2C2C3E] text-zinc-200 border border-[#36364A] font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                : "w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-rose-600/30"
            }
          >
            Leave Meeting
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-transparent hover:bg-[#232333] text-zinc-400 hover:text-zinc-200 text-xs py-2 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
