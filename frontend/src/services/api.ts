import {
  User,
  Meeting,
  MeetingParticipant,
  JoinRequest,
  MeetingCreatePayload,
  MeetingJoinPayload,
  JoinRequestCreatePayload,
  JoinRequestRespondPayload,
  ParticipantUpdatePayload,
  LiveKitTokenResponse,
  LiveKitTokenPayload,
} from "@/types/meeting";

const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  url = url.replace(/\/+$/, ""); // remove trailing slashes
  if (!url.endsWith("/api/v1") && !url.includes("/api/")) {
    url = `${url}/api/v1`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Core fetch wrapper with JSON serialization & X-User-Id injection
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Inject active persona from localStorage if available in browser
  // Only inject if X-User-Id was not explicitly provided or explicitly cleared
  if (typeof window !== "undefined" && headers["X-User-Id"] === undefined) {
    try {
      const storedUser = localStorage.getItem("zoom_current_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.id) {
          headers["X-User-Id"] = user.id;
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  } else if (headers["X-User-Id"] === "") {
    // Explicitly asked not to send X-User-Id (guest / anonymous join)
    delete headers["X-User-Id"];
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      errorData = await response.json();
      if (errorData?.detail) {
        errorMessage =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      }
    } catch {
      // Body was not JSON
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // --- USERS ---
  getUsers: () => request<User[]>("/users"),
  getCurrentUser: () => request<User>("/users/current"),
  getUser: (id: string) => request<User>(`/users/${id}`),
  signIn: (email: string) =>
    request<User>("/users/signin", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // --- MEETINGS ---
  getMeetings: (status?: string) =>
    request<Meeting[]>(`/meetings${status ? `?status=${status}` : ""}`),

  getUpcomingMeetings: () => request<Meeting[]>("/meetings/upcoming"),
  getRecentMeetings: () => request<Meeting[]>("/meetings/recent"),

  getMeeting: (idOrNumber: string) =>
    request<Meeting>(`/meetings/${idOrNumber}`),

  getMeetingByNumber: (meetingNumber: string) =>
    request<Meeting>(`/meetings/${meetingNumber}`),

  createInstantMeeting: (topic?: string, passcode?: string) =>
    request<Meeting>("/meetings/instant", {
      method: "POST",
      body: JSON.stringify({
        title: topic || "Instant Meeting",
        passcode: passcode || undefined,
      }),
    }),

  scheduleMeeting: (data: {
    title: string;
    start_time: string;
    duration_minutes?: number;
    passcode?: string | null;
    description?: string;
  }) =>
    request<Meeting>("/meetings/schedule", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createMeeting: (data: MeetingCreatePayload) =>
    request<Meeting>("/meetings", {
      method: "POST",
      body: JSON.stringify({
        title: data.topic,
        topic: data.topic,
        start_time: data.scheduled_start_time,
        scheduled_start_time: data.scheduled_start_time,
        duration_minutes: data.duration_minutes || 30,
        passcode: data.passcode,
        waiting_room_enabled: data.waiting_room_enabled,
        timezone: data.timezone,
        repeat_interval: data.repeat_interval,
        use_pmi: data.use_pmi,
        allow_chat_before_after: data.allow_chat_before_after,
        host_video_on: data.host_video_on,
        participant_video_on: data.participant_video_on,
        audio_type: data.audio_type,
        allow_join_anytime: data.allow_join_anytime,
        mute_participants_on_entry: data.mute_participants_on_entry,
        invitees: data.invitees,
      }),
    }),

  startMeeting: (meetingId: string) =>
    request<Meeting>(`/meetings/${meetingId}/start`, {
      method: "POST",
    }),

  endMeeting: (meetingId: string) =>
    request<Meeting>(`/meetings/${meetingId}/end`, {
      method: "POST",
    }),

  deleteMeeting: (meetingId: string) =>
    request<{ success: boolean; message: string }>(`/meetings/${meetingId}`, {
      method: "DELETE",
    }),

  getLiveKitToken: (
    idOrNumber: string,
    payload: LiveKitTokenPayload
  ) =>
    request<LiveKitTokenResponse>(`/meetings/${idOrNumber}/token`, {
      method: "POST",
      headers: {
        "X-User-Id": payload.user_id && !payload.user_id.startsWith("guest_") ? payload.user_id : "",
      },
      body: JSON.stringify(payload),
    }),

  // --- PARTICIPANTS ---
  getParticipants: (meetingId: string) =>
    request<MeetingParticipant[]>(`/meetings/${meetingId}/participants`),

  joinMeeting: (
    meetingId: string,
    data: {
      display_name: string;
      user_id?: string | null;
      is_audio_muted?: boolean;
      is_video_off?: boolean;
    }
  ) =>
    request<MeetingParticipant>(`/meetings/${meetingId}/participants/join`, {
      method: "POST",
      headers: {
        "X-User-Id": data.user_id && !data.user_id.startsWith("guest_") ? data.user_id : "",
      },
      body: JSON.stringify(data),
    }),


  leaveMeeting: (meetingId: string, participantId: string) =>
    request<MeetingParticipant>(
      `/meetings/${meetingId}/participants/${participantId}/leave`,
      {
        method: "POST",
      }
    ),

  updateParticipantState: (
    meetingId: string,
    participantId: string,
    data: ParticipantUpdatePayload
  ) =>
    request<MeetingParticipant>(
      `/meetings/${meetingId}/participants/${participantId}/state`,
      {
        method: "PATCH",
        body: JSON.stringify({
          is_audio_muted: data.audio_muted,
          is_video_off: data.video_muted,
          is_hand_raised: data.hand_raised,
          role: data.role?.toUpperCase(),
        }),
      }
    ),

  // --- JOIN REQUESTS (WAITING ROOM) ---
  getJoinRequests: (meetingId: string) =>
    request<JoinRequest[]>(`/meetings/${meetingId}/requests`),

  requestJoin: (
    meetingId: string,
    data: { display_name: string; user_id?: string | null }
  ) =>
    request<JoinRequest>(`/meetings/${meetingId}/requests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  respondJoinRequest: (
    meetingId: string,
    requestId: string,
    status: "ACCEPTED" | "REJECTED" | "admitted" | "rejected"
  ) =>
    request<JoinRequest>(
      `/meetings/${meetingId}/requests/${requestId}/respond`,
      {
        method: "POST",
        body: JSON.stringify({
          status: status.toUpperCase() === "ADMITTED" ? "ACCEPTED" : status.toUpperCase(),
        }),
      }
    ),
};

