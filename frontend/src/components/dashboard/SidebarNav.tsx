"use client";

import React from "react";
import { User } from "@/types/meeting";
import {
  Home,
  Sparkles,
  Calendar,
  MessageSquare,
  LayoutGrid,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarNavProps {
  currentUser: User | null;
  onOpenUserSwitcher: () => void;
  onOpenSettings?: () => void;
  activeNav?: string;
  onSelectNav?: (nav: string) => void;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentUser,
  onOpenUserSwitcher,
  onOpenSettings,
  activeNav = "home",
  onSelectNav,
  className,
}) => {
  const router = useRouter();

  const handleNavClick = (id: string) => {
    if (onSelectNav) {
      onSelectNav(id);
    } else {
      if (id === "home") router.push("/");
      else if (id === "chat") router.push("/chat");
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "zoommate", label: "ZoomMate", icon: <Sparkles className="h-5 w-5" /> },
    { id: "meetings", label: "Meetings", icon: <Calendar className="h-5 w-5" /> },
    { id: "chat", label: "Chat", icon: <MessageSquare className="h-5 w-5" /> },
    {
      id: "hub",
      label: "Hub",
      icon: <LayoutGrid className="h-5 w-5" />,
      badge: "New",
    },
    { id: "more", label: "More", icon: <MoreHorizontal className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={cn(
        "w-16 sm:w-20 bg-[#EBEFF2] dark:bg-[#11131B] flex flex-col items-center justify-between shrink-0 select-none transition-colors",
        className
      )}
    >
      {/* Navigation Items List */}
      <nav className="flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all cursor-pointer group relative",
                isActive
                  ? "bg-white dark:bg-[#181824] text-text-primary font-semibold shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-[#DEE3E7] dark:hover:bg-[#1C1F2B]"
              )}
              title={item.label}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 bg-zoom-blue text-white text-[7px] font-bold px-1 py-0.2 rounded-full shadow-xs uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Settings Button */}
      <div className="flex flex-col items-center w-full px-2 pb-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-text-muted hover:text-text-primary hover:bg-[#DEE3E7] dark:hover:bg-[#1C1F2B] transition-all cursor-pointer group"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-full font-medium">
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
};
