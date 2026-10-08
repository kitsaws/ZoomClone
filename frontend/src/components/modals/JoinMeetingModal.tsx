"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatMeetingId, cleanMeetingId } from "@/lib/utils";
import { api, ApiError } from "@/services/api";
import { useRouter } from "next/navigation";

export interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeetingNumber?: string;
  defaultName?: string;
}

export const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({
  isOpen,
  onClose,
  defaultMeetingNumber = "",
  defaultName = "",
}) => {
  const router = useRouter();
  const [meetingNumber, setMeetingNumber] = useState(defaultMeetingNumber);
  const [displayName, setDisplayName] = useState(defaultName);
  const [passcode, setPasscode] = useState("");
  const [rememberName, setRememberName] = useState(true);
  const [dontConnectAudio, setDontConnectAudio] = useState(false);
  const [turnOffVideo, setTurnOffVideo] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requiresPasscode, setRequiresPasscode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMeetingNumber(defaultMeetingNumber);
      if (defaultName) {
        setDisplayName(defaultName);
      } else {
        const saved = typeof window !== "undefined" ? localStorage.getItem("zoom_saved_name") : null;
        if (saved) setDisplayName(saved);
      }
      setErrorMessage(null);
      setRequiresPasscode(false);
      setPasscode("");
    }
  }, [isOpen, defaultMeetingNumber, defaultName]);

  const handleMeetingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = cleanMeetingId(raw);
    if (cleaned.length <= 11) {
      setMeetingNumber(formatMeetingId(cleaned));
    } else {
      setMeetingNumber(raw);
    }
    setErrorMessage(null);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNumber = cleanMeetingId(meetingNumber);
    if (!rawNumber) {
      setErrorMessage("Please enter a valid Meeting ID.");
      return;
    }

    if (!displayName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Verify meeting exists
      let meeting;
      try {
        meeting = await api.getMeetingByNumber(rawNumber);
      } catch {
        // Fallback check by raw ID
        meeting = await api.getMeeting(rawNumber);
      }

      // 2. Check if meeting requires passcode and it's missing or wrong
      if (meeting.passcode && (!passcode || passcode !== meeting.passcode)) {
        if (!requiresPasscode) {
          setRequiresPasscode(true);
          setErrorMessage("This meeting requires a passcode.");
          setIsLoading(false);
          return;
        } else {
          setErrorMessage("Incorrect passcode. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // Save name preference if checked
      if (rememberName && typeof window !== "undefined") {
        localStorage.setItem("zoom_saved_name", displayName.trim());
      }

      // Build route queries
      const params = new URLSearchParams();
      params.set("name", displayName.trim());
      if (dontConnectAudio) params.set("audio", "0");
      if (turnOffVideo) params.set("video", "0");
      if (passcode) params.set("pwd", passcode);

      onClose();
      router.push(`/meeting/${meeting.id}?${params.toString()}`);
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Meeting not found. Please verify the ID and try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join meeting"
      maxWidth="md"
      className="p-1"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="rounded-xl px-5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!meetingNumber.trim() || !displayName.trim()}
            loading={isLoading}
            onClick={handleJoin}
            className="rounded-xl px-7 font-semibold"
          >
            Join
          </Button>
        </>
      }
    >
      <form onSubmit={handleJoin} className="space-y-4">
        <Input
          placeholder="Meeting ID or personal link name"
          value={meetingNumber}
          onChange={handleMeetingNumberChange}
          error={errorMessage || undefined}
          autoFocus
          required
        />

        <Input
          placeholder="Enter your name"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setErrorMessage(null);
          }}
          required
        />

        {requiresPasscode && (
          <Input
            placeholder="Enter meeting passcode"
            type="password"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setErrorMessage(null);
            }}
            required
            autoFocus
          />
        )}

        {/* 3 Authentic Zoom Checkboxes */}
        <div className="space-y-2.5 pt-2 text-xs text-text-secondary">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberName}
              onChange={(e) => setRememberName(e.target.checked)}
              className="h-4 w-4 rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
            />
            <span>Remember my name for future meetings</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontConnectAudio}
              onChange={(e) => setDontConnectAudio(e.target.checked)}
              className="h-4 w-4 rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
            />
            <span>Don&apos;t connect to audio</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={turnOffVideo}
              onChange={(e) => setTurnOffVideo(e.target.checked)}
              className="h-4 w-4 rounded bg-surface-subtle border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
            />
            <span>Turn off my video</span>
          </label>
        </div>

        {/* Disclaimer Text */}
        <p className="text-[11px] text-text-muted leading-relaxed pt-2">
          By clicking &ldquo;Join&rdquo;, you agree to our{" "}
          <span className="text-zoom-blue hover:underline cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-zoom-blue hover:underline cursor-pointer">
            Privacy Statement
          </span>
          .
        </p>
      </form>
    </Modal>
  );
};
