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
} from "@/types/meeting";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  if (typeof window !== "undefined") {
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
        errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
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
  getUser: (id: string) => request<User>(`/users/${id}`),

  // --- MEETINGS ---
  getMeetings: (status?: string) =>
    request<Meeting[]>(`/meetings${status ? `?status=${status}` : ""}`),
  
  getMeeting: (id: string) => request<Meeting>(`/meetings/${id}`),
  
  getMeetingByNumber: (meetingNumber: string) =>
    request<Meeting>(`/meetings/by-number/${meetingNumber}`),

  createMeeting: (data: MeetingCreatePayload) =>
    request<Meeting>("/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  endMeeting: (meetingId: string) =>
    request<Meeting>(`/meetings/${meetingId}/end`, {
      method: "POST",
    }),

  // --- PARTICIPANTS ---
  getParticipants: (meetingId: string) =>
    request<MeetingParticipant[]>(`/meetings/${meetingId}/participants`),

  joinMeeting: (meetingId: string, data: MeetingJoinPayload) =>
    request<MeetingParticipant>(`/meetings/${meetingId}/join`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  leaveMeeting: (meetingId: string, participantId: string) =>
    request<{ message: string }>(
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
      `/meetings/${meetingId}/participants/${participantId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    ),

  // --- JOIN REQUESTS (WAITING ROOM) ---
  getJoinRequests: (meetingId: string, status?: string) =>
    request<JoinRequest[]>(
      `/meetings/${meetingId}/join-requests${status ? `?status=${status}` : ""}`
    ),

  requestJoin: (meetingId: string, data: JoinRequestCreatePayload) =>
    request<JoinRequest>(`/meetings/${meetingId}/join-requests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  respondJoinRequest: (
    meetingId: string,
    requestId: string,
    status: "admitted" | "rejected"
  ) =>
    request<JoinRequest>(
      `/meetings/${meetingId}/join-requests/${requestId}/respond`,
      {
        method: "POST",
        body: JSON.stringify({ status }),
      }
    ),
};
