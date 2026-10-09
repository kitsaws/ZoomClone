"use client";

import { useState, useEffect, useCallback } from "react";
import { Meeting, MeetingCreatePayload } from "@/types/meeting";
import { api, ApiError } from "@/services/api";
import { cleanMeetingId } from "@/lib/utils";

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to load meetings from server.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Derived filtered meeting lists (case-insensitive for robust backend parity)
  const activeMeetings = meetings.filter(
    (m) => m.status?.toUpperCase() === "ACTIVE"
  );
  const upcomingMeetings = meetings.filter(
    (m) =>
      m.status?.toUpperCase() === "SCHEDULED" ||
      m.status?.toUpperCase() === "WAITING" ||
      (!m.actual_start_time && m.status?.toUpperCase() !== "ENDED")
  );
  const recentMeetings = meetings.filter(
    (m) => m.status?.toUpperCase() === "ENDED"
  );

  // Instant meeting creation
  const createInstantMeeting = async (topic?: string): Promise<Meeting> => {
    const newMeeting = await api.createInstantMeeting(topic);
    await fetchMeetings();
    return newMeeting;
  };

  // Schedule future meeting
  const scheduleMeeting = async (
    payload: MeetingCreatePayload
  ): Promise<Meeting> => {
    const newMeeting = await api.createMeeting(payload);
    await fetchMeetings();
    return newMeeting;
  };

  // Verify and find meeting by raw 9-11 digit string or ID
  const findMeeting = async (meetingNumberOrId: string): Promise<Meeting> => {
    const cleaned = cleanMeetingId(meetingNumberOrId);
    if (!cleaned) {
      throw new Error("Invalid meeting number.");
    }
    try {
      // First try lookup by meeting number
      return await api.getMeetingByNumber(cleaned);
    } catch {
      // Fallback lookup by UUID if entered
      return await api.getMeeting(meetingNumberOrId);
    }
  };

  return {
    meetings,
    activeMeetings,
    upcomingMeetings,
    recentMeetings,
    isLoading,
    error,
    refreshMeetings: fetchMeetings,
    createInstantMeeting,
    scheduleMeeting,
    findMeeting,
  };
}

