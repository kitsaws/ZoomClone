"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { SignInForm } from "@/components/auth/SignInForm";
import { DemoAccountsList } from "@/components/auth/DemoAccountsList";
import { AiWorkplacePromo } from "@/components/auth/AiWorkplacePromo";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User } from "@/types/meeting";
import { Video, Link2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { currentUser, switchUser } = useCurrentUser();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestMeetingId, setGuestMeetingId] = useState("");
  const [guestDisplayName, setGuestDisplayName] = useState("");

  const handleUserSelect = (user: User) => {
    switchUser(user);
    router.push("/");
  };

  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestMeetingId.trim()) return;
    const cleaned = guestMeetingId.replace(/\D/g, "");
    const nameParam = encodeURIComponent(guestDisplayName.trim() || "Guest User");
    router.push(`/meeting/${cleaned}?name=${nameParam}&guest=true`);
  };

  return (
    <main className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-app-border px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-zoom-blue text-white rounded-xl p-1.5 shadow-md">
            <Video className="h-5 w-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-text-primary font-wordmark">
            zoom<span className="text-zoom-blue text-xs align-super ml-1 font-sans font-bold">workplace</span>
          </span>
        </Link>
      </header>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Sign-In Form & Demo Accounts */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Sign In to Zoom Workplace
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Enter your work email or choose a seeded demo persona below.
            </p>
          </div>

          <div className="bg-surface border border-app-border rounded-2xl p-6 shadow-sm">
            <SignInForm
              onSuccess={handleUserSelect}
              onJoinAsGuest={() => setIsGuestModalOpen(true)}
            />
          </div>

          {/* 1-Click Demo Accounts Selector */}
          <DemoAccountsList
            currentUserId={currentUser?.id}
            onSelectUser={handleUserSelect}
          />
        </div>

        {/* Right Column: AI Workplace Hero Showcase */}
        <div className="lg:col-span-6 xl:col-span-7 h-full">
          <AiWorkplacePromo />
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="border-t border-app-border py-4 px-6 text-center text-xs text-text-muted max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Zoom Clone. Built with Next.js, TypeScript, Tailwind CSS &amp; FastAPI.</span>
        <div className="flex items-center gap-4 text-[11px]">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary underline"
          >
            FastAPI Swagger Docs
          </a>
        </div>
      </footer>

      {/* Guest Join Modal */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title="Join Meeting as Guest"
        description="No account required. Enter meeting credentials to join directly."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsGuestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGuestJoin}>
              Proceed to Waiting Room
            </Button>
          </>
        }
      >
        <form onSubmit={handleGuestJoin} className="space-y-4">
          <Input
            label="Meeting ID or Personal Link"
            placeholder="e.g. 849 2018 3921"
            value={guestMeetingId}
            onChange={(e) => setGuestMeetingId(e.target.value)}
            leftIcon={<Link2 className="h-4 w-4" />}
            required
            autoFocus
          />
          <Input
            label="Your Display Name"
            placeholder="e.g. John Doe (Guest)"
            value={guestDisplayName}
            onChange={(e) => setGuestDisplayName(e.target.value)}
            required
          />
        </form>
      </Modal>
    </main>
  );
}
