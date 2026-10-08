export type UserRole = "host" | "co_host" | "participant" | "guest";
export type MeetingStatus = "waiting" | "active" | "ended";
export type JoinRequestStatus = "pending" | "admitted" | "rejected";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id?: string | null;
  display_name: string;
  role: UserRole;
  is_guest: boolean;
  audio_muted: boolean;
  video_muted: boolean;
  hand_raised: boolean;
  is_host: boolean;
  joined_at?: string;
  left_at?: string | null;
}

export interface Meeting {
  id: string;
  meeting_number: string;
  topic: string;
  host_id: string;
  passcode?: string | null;
  status: MeetingStatus;
  waiting_room_enabled: boolean;
  scheduled_start_time?: string | null;
  actual_start_time?: string | null;
  ended_at?: string | null;
  created_at?: string;
  participants?: MeetingParticipant[];
}

export interface JoinRequest {
  id: string;
  meeting_id: string;
  user_id?: string | null;
  display_name: string;
  status: JoinRequestStatus;
  created_at?: string;
  resolved_at?: string | null;
}

// Request Payload Types
export interface MeetingCreatePayload {
  topic: string;
  waiting_room_enabled?: boolean;
  scheduled_start_time?: string | null;
  passcode?: string | null;
}

export interface MeetingJoinPayload {
  meeting_id: string;
  passcode?: string | null;
  display_name?: string | null;
}

export interface JoinRequestCreatePayload {
  display_name: string;
}

export interface JoinRequestRespondPayload {
  status: "admitted" | "rejected";
}

export interface ParticipantUpdatePayload {
  audio_muted?: boolean;
  video_muted?: boolean;
  hand_raised?: boolean;
  role?: UserRole;
}
