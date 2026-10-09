export type UserRole = "host" | "co_host" | "participant" | "guest";
export type MeetingStatus = "waiting" | "active" | "ended";
export type JoinRequestStatus = "pending" | "admitted" | "rejected";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  pmi?: string | null;
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
  is_audio_muted?: boolean;
  is_video_off?: boolean;
  is_hand_raised?: boolean;
  joined_at?: string;
  left_at?: string | null;
}

export interface Meeting {
  id: string;
  meeting_number: string;
  topic: string;
  title?: string;
  description?: string | null;
  host_id: string;
  passcode?: string | null;
  status: MeetingStatus | string;
  waiting_room_enabled: boolean;
  scheduled_start_time?: string | null;
  start_time?: string | null;
  actual_start_time?: string | null;
  duration_minutes?: number;
  ended_at?: string | null;
  created_at?: string;
  timezone?: string;
  repeat_interval?: string;
  use_pmi?: boolean;
  allow_chat_before_after?: boolean;
  host_video_on?: boolean;
  participant_video_on?: boolean;
  audio_type?: string;
  allow_join_anytime?: boolean;
  mute_participants_on_entry?: boolean;
  invitees?: string | string[];
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
  scheduled_start_time?: string | null;
  scheduled_end_time?: string | null;
  duration_minutes?: number;
  timezone?: string;
  repeat_interval?: string;
  use_pmi?: boolean;
  passcode?: string | null;
  waiting_room_enabled?: boolean;
  allow_chat_before_after?: boolean;
  host_video_on?: boolean;
  participant_video_on?: boolean;
  audio_type?: string;
  allow_join_anytime?: boolean;
  mute_participants_on_entry?: boolean;
  invitees?: string[];
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

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  room_name: string;
  participant_identity: string;
  participant_name: string;
  is_host: boolean;
}

export interface LiveKitTokenPayload {
  display_name: string;
  user_id?: string | null;
  passcode?: string | null;
}

