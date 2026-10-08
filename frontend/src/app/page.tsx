"use client";

import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMeetings } from "@/hooks/useMeetings";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { ClockWidget } from "@/components/dashboard/ClockWidget";
import { ActionCards } from "@/components/dashboard/ActionCards";
import { MeetingTabs } from "@/components/dashboard/MeetingTabs";
import { ConnectingOverlay } from "@/components/modals/ConnectingOverlay";
import { JoinMeetingModal } from "@/components/modals/JoinMeetingModal";
import { ScheduleMeetingModal } from "@/components/modals/ScheduleMeetingModal";
import { UserSwitcherModal } from "@/components/modals/UserSwitcherModal";
import { MeetingCreatePayload } from "@/types/meeting";
import { useRouter } from "next/navigation";
import { Sparkles, Sun, Moon, Laptop } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, switchUser, logout } = useCurrentUser();
  const {
    upcomingMeetings,
    activeMeetings,
    recentMeetings,
    createInstantMeeting,
    scheduleMeeting,
  } = useMeetings();

  // Modals & Overlays state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingTitle, setConnectingTitle] = useState("Starting meeting...");

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  const toggleTheme = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.remove("dark");
    } else {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isSystemDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  // Instant meeting handler with Zoom connecting animation
  const handleInstantMeeting = async () => {
    setConnectingTitle("Starting instant meeting...");
    setIsConnecting(true);
    try {
      const meetingTopic = currentUser
        ? `${currentUser.display_name}'s Personal Meeting Room`
        : "Instant Meeting";
      const newMeeting = await createInstantMeeting(meetingTopic);

      // Short aesthetic delay to let the user see the Zoom pulse spinner
      setTimeout(() => {
        setIsConnecting(false);
        router.push(`/meeting/${newMeeting.id}`);
      }, 700);
    } catch (e: any) {
      setIsConnecting(false);
      alert(e?.message || "Failed to launch instant meeting.");
    }
  };

  const handleScheduleSubmit = async (payload: MeetingCreatePayload) => {
    return await scheduleMeeting(payload);
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-row antialiased transition-colors duration-200">
      {/* Left Vertical Sidebar Navigation */}
      <SidebarNav
        currentUser={currentUser}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-between overflow-y-auto max-h-screen">
        {/* Top Navbar */}
        <header className="border-b border-app-border px-6 py-4 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-text-primary">
              Zoom Workplace Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Pill */}
            <div className="bg-surface-subtle border border-app-border rounded-xl p-1 flex items-center shadow-inner">
              <button
                onClick={() => toggleTheme("light")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                  theme === "light" ? "bg-surface text-zoom-blue shadow-sm" : "text-text-muted hover:text-text-primary"
                )}
                title="Light Mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleTheme("dark")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                  theme === "dark" ? "bg-surface text-zoom-blue shadow-sm" : "text-text-muted hover:text-text-primary"
                )}
                title="Dark Mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleTheme("system")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                  theme === "system" ? "bg-surface text-zoom-blue shadow-sm" : "text-text-muted hover:text-text-primary"
                )}
                title="System Mode"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Component Gallery Link */}
            <Link
              href="/components"
              className="text-xs font-semibold bg-surface border border-app-border px-3 py-1.5 rounded-xl hover:text-zoom-blue transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-zoom-blue" />
              <span className="hidden sm:inline">UI Gallery</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Center Container */}
        <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
          {/* Real-time Clock Widget & User Greeting */}
          <ClockWidget userName={currentUser?.display_name} />

          {/* 4 Hero Action Tiles (Official SVGs) */}
          <ActionCards
            onNewMeeting={handleInstantMeeting}
            onJoin={() => setIsJoinModalOpen(true)}
            onSchedule={() => setIsScheduleModalOpen(true)}
            onShareScreen={() => setIsJoinModalOpen(true)}
          />

          {/* Tabbed Meetings Feeds (Upcoming, Live Rooms, Past History) */}
          <MeetingTabs
            upcomingMeetings={upcomingMeetings}
            activeMeetings={activeMeetings}
            recentMeetings={recentMeetings}
            currentUserId={currentUser?.id}
            onOpenSchedule={() => setIsScheduleModalOpen(true)}
            onOpenNewMeeting={handleInstantMeeting}
          />
        </div>

        {/* Bottom Footer */}
        <footer className="border-t border-app-border py-4 px-6 text-center text-xs text-text-muted max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Zoom Workplace Clone. Built with Next.js &amp; FastAPI.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/components" className="hover:text-text-primary underline">
              Component Showcase
            </Link>
            <Link href="/signin" className="hover:text-text-primary underline">
              Persona Sign In
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-primary underline"
            >
              Swagger REST Docs
            </a>
          </div>
        </footer>
      </main>

      {/* MODALS */}
      {/* 1. Zoom Loading Spinner Overlay */}
      <ConnectingOverlay
        isOpen={isConnecting}
        title={connectingTitle}
        subtitle="Connecting you to your secure room..."
      />

      {/* 2. Official Screenshot-Aligned Join Meeting Modal */}
      <JoinMeetingModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        defaultName={currentUser?.display_name || ""}
      />

      {/* 3. Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleSubmit}
        defaultTopic={currentUser ? `${currentUser.display_name}'s Sync` : "Team Sync"}
      />

      {/* 4. Multi-Persona Fast Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={switchUser}
        onSignOut={logout}
      />
    </div>
  );
}
