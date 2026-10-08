"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MeetingCreatePayload } from "@/types/meeting";
import { Clock, Lock, Shield, Sparkles } from "lucide-react";

export interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: MeetingCreatePayload) => Promise<any>;
  defaultTopic?: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  defaultTopic = "Architecture Review & Team Sync",
}) => {
  const [topic, setTopic] = useState(defaultTopic);
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("45");
  const [requirePasscode, setRequirePasscode] = useState(true);
  const [passcode, setPasscode] = useState("392184");
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTopic(defaultTopic);
      // Compute default next hour
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setStartDate(isoLocal);
      setError(null);
    }
  }, [isOpen, defaultTopic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please provide a meeting topic.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: MeetingCreatePayload = {
        topic: topic.trim(),
        scheduled_start_time: startDate ? new Date(startDate).toISOString() : null,
        waiting_room_enabled: enableWaitingRoom,
        passcode: requirePasscode ? passcode.trim() || null : null,
      };

      await onSchedule(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to schedule meeting.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Meeting"
      description="Configure your meeting parameters, calendar schedule, and security."
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isLoading}
            onClick={handleSubmit}
            className="px-6 font-semibold"
          >
            Save Schedule
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Topic"
          placeholder="e.g. Weekly Engineering Sync"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setError(null);
          }}
          error={error || undefined}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            leftIcon={<Clock className="h-4 w-4" />}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-surface-subtle border border-app-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-zoom-blue focus:ring-2 focus:ring-zoom-blue/20"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>
        </div>

        {/* Security Box */}
        <div className="bg-surface-subtle/80 border border-app-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider">
            <Shield className="h-4 w-4 text-zoom-blue" />
            <span>Security &amp; Access Controls</span>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-text-muted" />
                <span>Require meeting passcode</span>
              </span>
              <input
                type="checkbox"
                checked={requirePasscode}
                onChange={(e) => setRequirePasscode(e.target.checked)}
                className="h-4 w-4 rounded bg-surface border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
              />
            </label>

            {requirePasscode && (
              <div className="pl-6 pt-1">
                <input
                  type="text"
                  maxLength={10}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="bg-surface border border-app-border rounded-lg px-3 py-1.5 text-xs text-text-primary font-mono tracking-wider w-32 focus:outline-none focus:border-zoom-blue"
                  placeholder="Passcode"
                />
              </div>
            )}

            <label className="flex items-center justify-between cursor-pointer select-none pt-1">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-text-muted" />
                <span>Enable Waiting Room (Require host approval)</span>
              </span>
              <input
                type="checkbox"
                checked={enableWaitingRoom}
                onChange={(e) => setEnableWaitingRoom(e.target.checked)}
                className="h-4 w-4 rounded bg-surface border-app-border text-zoom-blue focus:ring-zoom-blue/30 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
};
