"use client";

import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ActionCard } from "@/components/ui/ActionCard";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  Video,
  Plus,
  Calendar,
  Share2,
  Sparkles,
  Link2,
  Clock,
  LogOut,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useCurrentUser();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [meetingIdInput, setMeetingIdInput] = useState("");
  const [guestNameInput, setGuestNameInput] = useState("");

  const handleInstantMeeting = () => {
    const instantId = "84920183921";
    router.push(`/meeting/${instantId}`);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingIdInput.trim()) return;
    const cleaned = meetingIdInput.replace(/\D/g, "");
    const query = guestNameInput ? `?name=${encodeURIComponent(guestNameInput)}` : "";
    router.push(`/meeting/${cleaned}${query}`);
  };

  return (
    <main className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-app-border px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-zoom-blue text-white rounded-xl p-1.5 shadow-md">
              <Video className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-text-primary font-wordmark">
              zoom<span className="text-zoom-blue text-xs align-super ml-1 font-sans font-bold">workplace</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-text-muted">
            <span className="px-3 py-1.5 rounded-lg bg-surface text-text-primary border border-app-border shadow-sm">
              Home
            </span>
            <Link
              href="/components"
              className="px-3 py-1.5 rounded-lg hover:text-text-primary hover:bg-surface transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-zoom-blue" />
              <span>Components Gallery</span>
            </Link>
          </nav>
        </div>

        {/* User Account / Sign In Pill */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-24 bg-surface animate-pulse rounded-xl" />
          ) : currentUser ? (
            <div className="flex items-center gap-2 bg-surface border border-app-border px-3 py-1.5 rounded-xl shadow-sm">
              <Avatar name={currentUser.display_name} size="sm" status="online" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-text-primary leading-tight">
                  {currentUser.display_name}
                </p>
                <p className="text-[10px] text-text-muted">{currentUser.email}</p>
              </div>
              <button
                onClick={logout}
                className="ml-2 text-text-muted hover:text-zoom-danger transition-colors p-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/signin">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Showcase Notification Banner */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-6">
        <div className="bg-gradient-to-r from-zoom-blue/15 via-purple-600/10 to-zoom-orange/15 border border-zoom-blue/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="bg-zoom-blue text-white rounded-xl p-2 shrink-0 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                UI Components Showcase Available (Light &amp; Dark Theme)
              </h3>
              <p className="text-xs text-text-secondary">
                Review all Zoom primitives, authentic brand color tokens (#2d8cff, #f26d21, #232333, #747487, #ffffff), typography, and live theme toggling on a single page.
              </p>
            </div>
          </div>
          <Link href="/components" className="shrink-0 w-full sm:w-auto">
            <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
              Open /components
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-5xl mx-auto w-full px-6 py-10 space-y-12">
        {/* 4 Hero Action Tiles */}
        <div className="bg-surface border border-app-border rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="flex items-center justify-around flex-wrap gap-8">
            <ActionCard
              title="New Meeting"
              variant="orange"
              hasDropdown={true}
              icon={<Video className="h-10 w-10 sm:h-12 sm:w-12" />}
              onClick={handleInstantMeeting}
            />
            <ActionCard
              title="Join"
              variant="blue"
              icon={<Plus className="h-10 w-10 sm:h-12 sm:w-12" />}
              onClick={() => setIsJoinModalOpen(true)}
            />
            <ActionCard
              title="Schedule"
              variant="blue"
              icon={<Calendar className="h-10 w-10 sm:h-12 sm:w-12" />}
              onClick={() => setIsScheduleModalOpen(true)}
            />
            <ActionCard
              title="Share Screen"
              variant="blue"
              icon={<Share2 className="h-10 w-10 sm:h-12 sm:w-12" />}
              onClick={() => setIsJoinModalOpen(true)}
            />
          </div>
        </div>

        {/* Scheduled Meetings Feed */}
        <div className="bg-surface border border-app-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zoom-blue" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Upcoming &amp; Active Meetings
              </h2>
            </div>
            <Badge variant="active" dot={true}>
              1 Active Room
            </Badge>
          </div>

          <div className="divide-y divide-app-border">
            {/* Active Seeded Meeting */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Scaler Fullstack Architecture Sync
                  </h4>
                  <Badge variant="host" size="sm">
                    In Progress
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Meeting ID: <strong className="text-text-primary">849 2018 3921</strong> • Host: Swastik Nagpal • 3 Participants in room
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/meeting/84920183921")}
              >
                Join Live Call
              </Button>
            </div>

            {/* Upcoming Sync */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-text-primary">
                  Sprint Planning &amp; AI Feature Roadmap
                </h4>
                <p className="text-xs text-text-secondary">
                  Meeting ID: 912 4430 1822 • Starts Today at 3:00 PM • Host: Alex Chen
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsScheduleModalOpen(true)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="border-t border-app-border py-4 px-6 text-center text-xs text-text-muted max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Zoom Clone. Built with Next.js &amp; FastAPI.</span>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/components" className="hover:text-text-primary underline">
            UI Showcase Gallery
          </Link>
          <Link href="/signin" className="hover:text-text-primary underline">
            Sign In / Personas
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary underline"
          >
            Backend Swagger Docs
          </a>
        </div>
      </footer>

      {/* Join Meeting Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join a Meeting"
        description="Enter the meeting ID or personal link to join."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleJoinSubmit}>
              Join Room
            </Button>
          </>
        }
      >
        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <Input
            label="Meeting ID or Personal Link Name"
            placeholder="e.g. 849 2018 3921"
            value={meetingIdInput}
            onChange={(e) => setMeetingIdInput(e.target.value)}
            leftIcon={<Link2 className="h-4 w-4" />}
            required
            autoFocus
          />
          {!currentUser && (
            <Input
              label="Your Display Name"
              placeholder="e.g. Guest User"
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              required
            />
          )}
        </form>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule a Meeting"
        description="Configure your meeting parameters."
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
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Topic" defaultValue="Weekly Architecture Sync" />
          <Input label="Start Time" type="datetime-local" />
          <Input label="Duration (Minutes)" type="number" defaultValue="30" />
        </div>
      </Modal>
    </main>
  );
}
