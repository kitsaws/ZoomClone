"use client";

import React from "react";
import { ZoomLogo } from "@/components/ui/ZoomLogo";
import { User } from "@/types/meeting";
import { cn } from "@/lib/utils";

export interface TopNavbarProps {
  currentUser?: User | null;
  onOpenUserSwitcher?: () => void;
  className?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentUser,
  onOpenUserSwitcher,
  className,
}) => {
  return (
    <header
      className={cn(
        "w-full bg-[#EBEFF2] dark:bg-[#11131B] px-4 py-2 flex items-center justify-between select-none shrink-0 text-text-primary z-30",
        className
      )}
    >
      {/* Leftmost: Zoom Workplace Brand Logo */}
      <div className="flex items-center gap-3">
        <ZoomLogo />
      </div>

      {/* Right: User Persona Profile Avatar */}
      {onOpenUserSwitcher && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={onOpenUserSwitcher}
            className="relative cursor-pointer group"
            title={
              currentUser
                ? `Signed in as ${currentUser.display_name} (Click to switch)`
                : "Sign in"
            }
          >
            <div className="w-10 h-10 rounded-2xl bg-[#8B1A2B] text-white font-bold text-[10px] flex items-center justify-center shadow-sm hover:ring-2 hover:ring-zoom-blue/40 transition-all">
              {(currentUser?.display_name?.[0] || "S").toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-zinc-900 rounded-full" />
          </button>
        </div>
      )}
    </header>
  );
};
