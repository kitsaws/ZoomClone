"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ActionCard } from "@/components/ui/ActionCard";
import { VideoTile } from "@/components/ui/VideoTile";
import { ControlBar } from "@/components/ui/ControlBar";
import {
  Video,
  Plus,
  Calendar,
  Share2,
  Lock,
  Sparkles,
  Link2,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { HostIcon, JoinIcon, ScheduleIcon, ShareIcon } from "@/components/icons/ZoomIcons";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

export function ComponentGallery() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [demoInput, setDemoInput] = useState("849 2018 3921");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Initialize and apply theme changes to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System mode
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isSystemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  const colors = [
    { name: "zoom-blue", hex: "#2d8cff", role: "Primary Brand Blue / Actions" },
    { name: "zoom-orange", hex: "#f26d21", role: "New Meeting Hero / Highlights" },
    { name: "zoom-dark-canvas", hex: "#232333", role: "Dark Canvas Background" },
    { name: "zoom-card-surface", hex: "#2C2C3E", role: "Dark Card Surface" },
    { name: "zoom-muted-text", hex: "#747487", role: "Secondary Typography" },
    { name: "zoom-white", hex: "#ffffff", role: "Light Canvas / Dark Text" },
    { name: "zoom-border", hex: "#36364A", role: "Dividers & Borders" },
    { name: "zoom-success", hex: "#28a745", role: "Active Mic / Online Status" },
    { name: "zoom-danger", hex: "#e02828", role: "End Call / Muted Indicators" },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary p-6 md:p-12 max-w-7xl mx-auto space-y-16 transition-colors duration-200">
      {/* Top Header */}
      <div className="border-b border-app-border pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            {/* Zoom Wordmark */}
            <div className="flex items-center gap-1.5">
              <div className="bg-zoom-blue text-white rounded-xl p-2 shadow-lg">
                <Video className="h-6 w-6" />
              </div>
              <span className="text-3xl font-black tracking-tight text-text-primary font-wordmark">
                zoom<span className="text-zoom-blue text-sm align-super ml-1 font-sans font-bold">workplace</span>
              </span>
            </div>
            <Badge variant="host" size="sm">Design System</Badge>
          </div>
          <p className="text-text-muted text-sm mt-2">
            Interactive Component Showcase — Preview and analyze every UI primitive, state, and typography token in both Light and Dark mode.
          </p>
        </div>

        {/* Right Header Actions: Theme Toggle & Modal Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Theme Selector Pill */}
          <div className="bg-surface border border-app-border rounded-xl p-1 flex items-center shadow-sm">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                theme === "light"
                  ? "bg-zoom-blue text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
              title="Light Theme"
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                theme === "dark"
                  ? "bg-zoom-blue text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
              title="Dark Theme"
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                theme === "system"
                  ? "bg-zoom-blue text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
              title="System Theme"
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>System</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJoinModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Preview Join Modal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Preview Schedule Modal
          </Button>
        </div>
      </div>

      {/* SECTION 1: COLOR TOKENS PALETTE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <span className="text-zoom-blue">1.</span> Authentic Zoom Color Palette
          </h2>
          <span className="text-xs text-text-muted">Click hex code to copy</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {colors.map((c) => (
            <div
              key={c.name}
              onClick={() => handleCopy(c.hex)}
              className="bg-surface border border-app-border rounded-xl p-3 flex flex-col gap-2.5 cursor-pointer hover:border-zoom-blue transition-all group shadow-sm hover:shadow-md"
            >
              <div
                className="w-full h-14 rounded-lg shadow-inner flex items-center justify-center font-mono text-xs font-bold border border-black/10"
                style={{
                  backgroundColor: c.hex,
                  color: c.hex === "#ffffff" ? "#232333" : "#ffffff",
                }}
              >
                {copiedColor === c.hex ? "COPIED!" : c.hex}
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary group-hover:text-zoom-blue transition-colors">
                  {c.name}
                </p>
                <p className="text-[11px] text-text-muted truncate">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: TYPOGRAPHY HIERARCHY */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="text-zoom-blue">2.</span> Typography &amp; Font Stack
        </h2>
        <div className="bg-surface border border-app-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Logo Wordmark Styling</span>
              <p className="text-4xl font-extrabold tracking-tight text-text-primary font-wordmark mt-1">
                zoom <span className="text-lg font-medium text-text-muted">Workplace</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Kaleko 205 Regular inspired curvature with custom rounded edges on &apos;Z&apos; and &apos;m&apos;.
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">UI Font Hierarchy</span>
              <p className="text-xs text-text-secondary mt-1">
                Baseline: <strong className="text-text-primary">Lato</strong> • Inherits OS defaults: Windows (<strong className="text-text-primary">Segoe UI</strong>), macOS (<strong className="text-text-primary">San Francisco</strong>), Android (<strong className="text-text-primary">Roboto</strong>).
              </p>
            </div>
          </div>

          <div className="space-y-2 border-l border-app-border pl-0 md:pl-6">
            <div className="text-2xl font-bold text-text-primary">Header 1 — Instant Collaboration</div>
            <div className="text-lg font-semibold text-text-secondary">Header 2 — Scheduled Team Sync</div>
            <div className="text-sm font-normal text-text-primary/90">Body Text — Connect seamlessly with enterprise-grade audio and video streaming.</div>
            <div className="text-xs text-text-muted">Caption / Metadata — Meeting ID: 849 2018 3921 • Host: Swastik Nagpal</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HERO ACTION TILES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <span className="text-zoom-blue">3.</span> Zoom Hero Action Tiles (Dashboard 4-Grid)
          </h2>
          <span className="text-xs text-text-muted">Interactive hover &amp; dropdown controls</span>
        </div>

        <div className="bg-surface border border-app-border rounded-2xl p-8 flex items-center justify-around flex-wrap gap-6 shadow-sm">
          <ActionCard
            title="New Meeting"
            variant="orange"
            hasDropdown={true}
            icon={<HostIcon className="h-9 w-9" />}
            onClick={() => alert("New Meeting Clicked")}
          />
          <ActionCard
            title="Join"
            variant="blue"
            icon={<JoinIcon className="h-9 w-9" />}
            onClick={() => setIsJoinModalOpen(true)}
          />
          <ActionCard
            title="Schedule"
            variant="blue"
            icon={<ScheduleIcon className="h-9 w-9" />}
            onClick={() => setIsScheduleModalOpen(true)}
          />
          <ActionCard
            title="Share Screen"
            variant="blue"
            icon={<ShareIcon className="h-9 w-9" />}
            onClick={() => alert("Share Screen Clicked")}
          />
        </div>
      </section>

      {/* SECTION 4: BUTTONS & STATES */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="text-zoom-blue">4.</span> Button Variants &amp; Interactive States
        </h2>

        <div className="bg-surface border border-app-border rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Variants row */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Variants (Size: Medium)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Zoom Blue (#2d8cff)</Button>
              <Button variant="orange">Hero Orange (#f26d21)</Button>
              <Button variant="secondary">Secondary Surface</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger (#e02828)</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="subtle">Subtle</Button>
            </div>
          </div>

          {/* Sizes & States row */}
          <div className="pt-4 border-t border-app-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Sizes &amp; States
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="primary">Small (sm)</Button>
              <Button size="md" variant="primary">Medium (md)</Button>
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Large (lg)
              </Button>
              <Button variant="primary" loading={true}>Loading State</Button>
              <Button variant="primary" disabled={true}>Disabled State</Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FORM INPUTS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="text-zoom-blue">5.</span> Form Inputs &amp; Focus Glow
        </h2>

        <div className="bg-surface border border-app-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
          <Input
            label="Meeting ID or Link"
            placeholder="Enter 9-11 digit meeting number"
            value={demoInput}
            onChange={(e) => setDemoInput(e.target.value)}
            leftIcon={<Link2 className="h-4 w-4" />}
            helperText="e.g. 849 2018 3921"
          />

          <Input
            label="Passcode (Optional)"
            placeholder="Enter numeric passcode"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            helperText="Protected with 6-digit encryption"
          />

          <Input
            label="Validation Error State"
            defaultValue="invalid-id"
            error="Meeting not found. Please verify the ID."
            leftIcon={<Link2 className="h-4 w-4" />}
            readOnly
          />
        </div>
      </section>

      {/* SECTION 6: BADGES & ROLES */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="text-zoom-blue">6.</span> Badges &amp; Status Indicators
        </h2>

        <div className="bg-surface border border-app-border rounded-2xl p-6 flex flex-wrap items-center gap-3 shadow-sm">
          <Badge variant="host" dot={true}>Host</Badge>
          <Badge variant="coHost" dot={true}>Co-Host</Badge>
          <Badge variant="participant">Participant</Badge>
          <Badge variant="guest" dot={true}>Guest User</Badge>
          <Badge variant="active" dot={true}>In-Meeting</Badge>
          <Badge variant="waiting" dot={true}>Waiting Room</Badge>
          <Badge variant="ended">Ended</Badge>
          <Badge variant="danger" dot={true}>Declined</Badge>
        </div>
      </section>

      {/* SECTION 7: AVATARS & PRESENCE */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="text-zoom-blue">7.</span> Avatars &amp; Persona Presence
        </h2>

        <div className="bg-surface border border-app-border rounded-2xl p-6 flex flex-wrap items-center gap-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar name="Swastik Nagpal" status="online" size="lg" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Swastik Nagpal (Host)</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online &amp; Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar name="Alex Chen" status="in-meeting" size="lg" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Alex Chen</p>
              <p className="text-xs text-zoom-blue font-medium">In Meeting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar name="Sarah Miller" status="muted" size="lg" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Sarah Miller</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Microphone Muted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar name="David Kumar" status="offline" size="lg" />
            <div>
              <p className="text-sm font-semibold text-text-primary">David Kumar</p>
              <p className="text-xs text-text-muted font-medium">Offline</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: VIDEO GRID PARTICIPANT TILES */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <span className="text-zoom-blue">8.</span> In-Meeting Video Grid Tiles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tile 1: Active Speaker */}
          <VideoTile
            name="Swastik Nagpal"
            isHost={true}
            isSelf={true}
            isSpeaking={true}
            isAudioMuted={false}
            isVideoMuted={false}
          />

          {/* Tile 2: Muted Participant with Hand Raised */}
          <VideoTile
            name="Alex Chen"
            isHost={false}
            isSpeaking={false}
            isAudioMuted={true}
            isVideoMuted={false}
            isHandRaised={true}
          />

          {/* Tile 3: Video Off Avatar Mode */}
          <VideoTile
            name="Sarah Miller"
            isHost={false}
            isSpeaking={false}
            isAudioMuted={true}
            isVideoMuted={true}
          />
        </div>
      </section>

      {/* SECTION 9: IN-MEETING CONTROL BAR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <span className="text-zoom-blue">9.</span> Interactive In-Meeting Control Bar
          </h2>
          <span className="text-xs text-text-muted">Click Mute / Video to test toggles</span>
        </div>

        <div className="border border-app-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#12121A] p-8 text-center text-zoom-muted-text text-sm flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-zoom-blue" />
            <span className="text-white/80">Simulated Meeting Stage (#000000 Canvas)</span>
          </div>
          <ControlBar
            participantCount={4}
            unreadChatCount={2}
            isHost={true}
            onEndMeeting={() => alert("End meeting action triggered")}
          />
        </div>
      </section>

      {/* INTERACTIVE MODALS */}
      {/* Join Meeting Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Meeting"
        description="Enter the meeting ID or personal link to join the room."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsJoinModalOpen(false);
                alert("Joining meeting...");
              }}
            >
              Join
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Meeting ID or Personal Link Name"
            placeholder="e.g. 849 2018 3921"
            defaultValue="849 2018 3921"
            leftIcon={<Link2 className="h-4 w-4" />}
          />
          <Input
            label="Your Name (For Guests)"
            placeholder="Enter your display name"
            defaultValue="Guest User"
          />
          <div className="space-y-2 pt-2 text-xs text-text-secondary">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue" defaultChecked />
              <span>Remember my name for future meetings</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue" />
              <span>Do not connect to audio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue" />
              <span>Turn off my video</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Meeting"
        description="Configure your meeting topic, schedule time, and waiting room security."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsScheduleModalOpen(false);
                alert("Meeting scheduled!");
              }}
            >
              Save Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Topic"
            placeholder="Meeting Topic"
            defaultValue="Scaler Fullstack Architecture Review"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="datetime-local"
              leftIcon={<Clock className="h-4 w-4" />}
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              defaultValue="45"
            />
          </div>
          <div className="space-y-2 pt-2 text-xs text-text-secondary">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue" defaultChecked />
              <span>Enable Waiting Room (Require host approval)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue" defaultChecked />
              <span>Require meeting passcode</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
