"use client";

import React from "react";
import { Video } from "lucide-react";

export interface ConnectingOverlayProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
}

export const ConnectingOverlay: React.FC<ConnectingOverlayProps> = ({
  isOpen,
  title = "Starting meeting...",
  subtitle = "Preparing high-definition audio & video room...",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-surface border border-app-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
        {/* Pulsing Zoom Logo Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-zoom-blue/30 animate-ping opacity-75" />
          <div className="relative h-16 w-16 bg-zoom-blue text-white rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(45,140,255,0.4)]">
            <Video className="h-8 w-8" />
          </div>
        </div>

        {/* Spinner & Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-text-primary tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Custom Progress Ring */}
        <div className="flex items-center gap-1.5 pt-2">
          <div className="h-2 w-2 rounded-full bg-zoom-blue animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-zoom-blue animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-zoom-blue animate-bounce" />
        </div>
      </div>
    </div>
  );
};
