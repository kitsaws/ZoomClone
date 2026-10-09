"use client";

import React from "react";
import { X } from "lucide-react";

export interface ConnectingOverlayProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}

export const ConnectingOverlay: React.FC<ConnectingOverlayProps> = ({
  isOpen,
  title = "Connecting...",
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none font-sans">
      {/* Zoom Desktop Shell Window (Screenshot 2) */}
      <div className="w-[360px] sm:w-[400px] bg-[#EBEFF2] border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-900 animate-in zoom-in-95 duration-200">
        {/* Title Bar */}
        <div className="px-3 py-2 bg-[#E1E6EB] border-b border-zinc-300/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4.5 h-4.5 bg-zoom-blue text-white text-[9px] font-bold rounded flex items-center justify-center shadow-xs">
              zm
            </div>
            <span className="text-xs font-semibold text-[#1F2429] tracking-tight">
              {title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-0.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-black/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-10">
          {/* Zoom Workplace Wordmark Branding */}
          <div className="flex flex-col items-center select-none pt-2">
            {/* Zoom Blue SVG */}
            <svg
              height="34"
              viewBox="0 0 114 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-auto text-[#0B5CFF]"
            >
              <path
                d="m23.6977 25.2924h-20.10301c-1.32885 0-2.58954-.6978-3.202853-1.8892-.698493-1.3617-.4429462-2.9956.630343-4.068l13.98692-13.97375h-10.01743c-2.7599 0-4.99167-2.22968-4.99167-4.987h18.5186c1.3288 0 2.5895.69784 3.2028 1.88927.6986 1.36164.443 2.9956-.6303 4.0679l-13.98691 13.97378h11.60181c2.7599 0 4.9917 2.2297 4.9917 4.987zm79.5603-25.2924c-2.879 0-5.4691 1.24249-7.241 3.23389-1.7883-1.9914-4.3781-3.23389-7.2401-3.23389-5.3497 0-9.7108 4.56149-9.7108 9.88887v15.40353c2.7598 0 4.9915-2.2297 4.9915-4.987v-10.46757c0-2.5701 1.9933-4.74871 4.5487-4.85083 2.692-.10213 4.9237 2.05945 4.9237 4.73169v10.58671c0 2.7573 2.2317 4.987 4.9915 4.987v-15.45457c0-2.5701 1.9935-4.74871 4.5485-4.85083 2.692-.10213 4.924 2.05945 4.924 4.73169v10.58671c0 2.7573 2.232 4.987 4.991 4.987v-15.40353c-.017-5.32738-4.378-9.88887-9.727-9.88887zm-54.3805 12.8334c0 7.0806-5.7583 12.8335-12.8455 12.8335-7.0871 0-12.8454-5.7529-12.8454-12.8335 0-7.0805 5.7753-12.8334 12.8454-12.8334 7.0702 0 12.8455 5.7529 12.8455 12.8334zm-4.9917 0c0-4.32315-3.5265-7.8464-7.8538-7.8464-4.3272 0-7.8538 3.52325-7.8538 7.8464 0 4.3233 3.5266 7.8465 7.8538 7.8465 4.3273 0 7.8538-3.5232 7.8538-7.8465zm32.6758 0c0 7.0806-5.758 12.8335-12.8451 12.8335-7.0877 0-12.8458-5.7529-12.8458-12.8335 0-7.0805 5.7757-12.8334 12.8458-12.8334 7.0696 0 12.8451 5.7529 12.8451 12.8334zm-4.9915 0c0-4.32315-3.5264-7.8464-7.8536-7.8464-4.3273 0-7.8541 3.52325-7.8541 7.8464 0 4.3233 3.5268 7.8465 7.8541 7.8465 4.3272 0 7.8536-3.5232 7.8536-7.8465z"
                fill="currentColor"
              />
            </svg>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2429] mt-1 font-sans">
              Workplace
            </h2>
          </div>

          {/* Radial Spoke Spinner Component & Text (Screenshot 2) */}
          <div className="flex flex-col items-center space-y-3 pb-2">
            <svg
              className="animate-spin h-9 w-9 text-zinc-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs font-medium text-[#666B72]">
              Connecting...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
