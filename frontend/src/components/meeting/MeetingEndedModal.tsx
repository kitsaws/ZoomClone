"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface MeetingEndedModalProps {
  isOpen: boolean;
  onGoToDashboard?: () => void;
}

export const MeetingEndedModal: React.FC<MeetingEndedModalProps> = ({
  isOpen,
  onGoToDashboard,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative bg-[#1B1B26] border border-[#2C2C3E] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-zinc-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Meeting ended by the Host
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            The host has ended this meeting for all participants. All audio and video streams have been closed.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleDashboard}
            leftIcon={<Home className="h-4 w-4" />}
            className="w-full rounded-xl py-3 font-semibold text-sm shadow-lg shadow-zoom-blue/20"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
