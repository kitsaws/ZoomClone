"use client";

import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { User } from "@/types/meeting";
import {
  Home,
  MessageSquare,
  Phone,
  FileText,
  LayoutGrid,
  Film,
  MoreHorizontal,
  Settings,
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SidebarNavProps {
  currentUser: User | null;
  onOpenUserSwitcher: () => void;
  activeNav?: string;
  onSelectNav?: (nav: string) => void;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentUser,
  onOpenUserSwitcher,
  activeNav = "home",
  onSelectNav,
  className,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "chat", label: "Chat", icon: <MessageSquare className="h-5 w-5" />, badge: "2" },
    { id: "phone", label: "Phone", icon: <Phone className="h-5 w-5" /> },
    { id: "docs", label: "Docs", icon: <FileText className="h-5 w-5" /> },
    { id: "whiteboards", label: "Whiteboards", icon: <LayoutGrid className="h-5 w-5" /> },
    { id: "clips", label: "Clips", icon: <Film className="h-5 w-5" /> },
    { id: "more", label: "More", icon: <MoreHorizontal className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={cn(
        "w-16 sm:w-20 bg-surface border-r border-app-border py-4 flex flex-col items-center justify-between shrink-0 select-none shadow-sm transition-colors",
        className
      )}
    >
      {/* Top Brand Icon */}
      <div className="flex flex-col items-center gap-4 w-full">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 group"
          title="Zoom Workplace"
        >
          <div className="h-8 w-8 bg-zoom-blue text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Video className="h-4.5 w-4.5" />
          </div>
          <span className="text-[9px] font-black tracking-tight text-text-primary font-wordmark">
            zoom
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-1.5">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectNav?.(item.id)}
                className={cn(
                  "w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer group",
                  isActive
                    ? "bg-surface-hover text-zoom-blue font-bold shadow-sm"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-subtle"
                )}
                title={item.label}
              >
                {/* Left Active Accent Bar */}
                {isActive && (
                  <span className="absolute -left-1.5 top-1.5 bottom-1.5 w-1 bg-zoom-blue rounded-r-full" />
                )}

                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-zoom-orange text-white text-[8px] font-bold h-3 w-3 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="flex flex-col items-center gap-2 w-full px-1.5">
        {/* Component Showcase Gallery Shortcut */}
        <Link
          href="/components"
          className="p-2 rounded-xl text-text-muted hover:text-zoom-blue hover:bg-surface-subtle transition-colors relative group"
          title="Open UI Component Gallery"
        >
          <Sparkles className="h-4 w-4 text-zoom-blue" />
        </Link>

        {/* Settings button */}
        <button
          onClick={() => alert("Settings dialog")}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User Persona Avatar */}
        <button
          onClick={onOpenUserSwitcher}
          className="mt-0.5 p-0.5 rounded-full hover:ring-2 hover:ring-zoom-blue/50 transition-all cursor-pointer group"
          title={currentUser ? `Signed in as ${currentUser.display_name} (Click to switch)` : "Click to sign in"}
        >
          <Avatar
            name={currentUser?.display_name || "Guest"}
            size="sm"
            status={currentUser ? "online" : "none"}
          />
        </button>
      </div>
    </aside>
  );

};
