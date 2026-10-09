"use client";

import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMeetings } from "@/hooks/useMeetings";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { MainDashboard } from "@/components/dashboard/MainDashboard";
import { ConnectingOverlay } from "@/components/modals/ConnectingOverlay";
import { JoinMeetingModal } from "@/components/modals/JoinMeetingModal";
import { ScheduleMeetingModal } from "@/components/modals/ScheduleMeetingModal";
import { CopyInvitationModal } from "@/components/modals/CopyInvitationModal";
import { UserSwitcherModal } from "@/components/modals/UserSwitcherModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Meeting, MeetingCreatePayload } from "@/types/meeting";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, switchUser, logout } = useCurrentUser();
  const {
    upcomingMeetings,
    activeMeetings,
    recentMeetings,
    createInstantMeeting,
    scheduleMeeting,
    deleteMeeting,
  } = useMeetings();

  // Navigation & Modals state
  const [activeNav, setActiveNav] = useState("home");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scheduledMeetingForInvite, setScheduledMeetingForInvite] = useState<Meeting | null>(null);
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

      // Short delay for the authentic Zoom pulse connection effect
      setTimeout(() => {
        setIsConnecting(false);
        router.push(`/meeting/${newMeeting.id}`);
      }, 600);
    } catch (e: any) {
      setIsConnecting(false);
      alert(e?.message || "Failed to launch instant meeting.");
    }
  };

  const handleScheduleSubmit = async (payload: MeetingCreatePayload) => {
    const meeting = await scheduleMeeting(payload);
    setIsScheduleModalOpen(false);
    setScheduledMeetingForInvite(meeting);
    return meeting;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#EBEFF2] dark:bg-[#11131B] text-text-primary flex flex-col antialiased select-none font-sans transition-colors duration-200">
      {/* 1. Full-Width Top Navbar */}
      <TopNavbar
        currentUser={currentUser}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
      />

      {/* 2. Main Body: Sidebar + Floating White Dashboard */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* Left Vertical Sidebar Navigation */}
        <SidebarNav
          currentUser={currentUser}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Floating White Main Dashboard Entity */}
        <MainDashboard
          upcomingMeetings={upcomingMeetings}
          activeMeetings={activeMeetings}
          recentMeetings={recentMeetings}
          currentUserId={currentUser?.id}
          currentUserName={currentUser?.display_name || "Host"}
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
          onOpenNewMeeting={handleInstantMeeting}
          onOpenJoin={() => setIsJoinModalOpen(true)}
          onOpenShareScreen={() => setIsJoinModalOpen(true)}
          onDeleteMeeting={deleteMeeting}
        />
      </div>

      {/* MODALS */}
      {/* 1. Zoom Loading Spinner Overlay */}
      <ConnectingOverlay
        isOpen={isConnecting}
        title={connectingTitle}
        subtitle="Connecting you to your secure room..."
      />

      {/* 2. Join Meeting Modal */}
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

      {/* 4. Copy Invitation Modal */}
      <CopyInvitationModal
        isOpen={!!scheduledMeetingForInvite}
        onClose={() => setScheduledMeetingForInvite(null)}
        meeting={scheduledMeetingForInvite}
        hostName={currentUser?.display_name || "Host"}
      />

      {/* 5. Fast User Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={switchUser}
        onSignOut={logout}
      />

      {/* 6. Settings Modal (Theme & Persona) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
