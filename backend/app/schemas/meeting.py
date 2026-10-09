from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, computed_field
from app.models.meeting import MeetingStatus
from app.schemas.user import UserResponse
from app.schemas.participant import ParticipantResponse


class MeetingBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None


class InstantMeetingCreate(BaseModel):
    title: Optional[str] = "Instant Meeting"
    host_id: Optional[str] = None  # Uses active session user if None
    passcode: Optional[str] = None


class ScheduleMeetingCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    start_time: datetime
    duration_minutes: int = Field(default=30, ge=5, le=1440)
    host_id: Optional[str] = None
    passcode: Optional[str] = None
    timezone: Optional[str] = "India (GMT+5:30)"
    repeat_interval: Optional[str] = "never"
    use_pmi: Optional[bool] = False
    waiting_room_enabled: Optional[bool] = False
    allow_chat_before_after: Optional[bool] = True
    host_video_on: Optional[bool] = True
    participant_video_on: Optional[bool] = True
    audio_type: Optional[str] = "computer"
    allow_join_anytime: Optional[bool] = True
    mute_participants_on_entry: Optional[bool] = False
    invitees: Optional[List[str]] = []


class MeetingUniversalCreate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    scheduled_start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = 30
    passcode: Optional[str] = None
    waiting_room_enabled: Optional[bool] = False
    host_id: Optional[str] = None
    timezone: Optional[str] = "India (GMT+5:30)"
    repeat_interval: Optional[str] = "never"
    use_pmi: Optional[bool] = False
    allow_chat_before_after: Optional[bool] = True
    host_video_on: Optional[bool] = True
    participant_video_on: Optional[bool] = True
    audio_type: Optional[str] = "computer"
    allow_join_anytime: Optional[bool] = True
    mute_participants_on_entry: Optional[bool] = False
    invitees: Optional[List[str]] = []


class MeetingResponse(MeetingBase):
    id: str
    meeting_number: str
    host_id: str
    passcode: Optional[str] = None
    status: MeetingStatus
    start_time: datetime
    duration_minutes: int
    invite_link: str
    created_at: datetime
    updated_at: datetime
    participant_count: Optional[int] = 0
    timezone: Optional[str] = "India (GMT+5:30)"
    repeat_interval: Optional[str] = "never"
    use_pmi: Optional[bool] = False
    waiting_room_enabled: Optional[bool] = False
    allow_chat_before_after: Optional[bool] = True
    host_video_on: Optional[bool] = True
    participant_video_on: Optional[bool] = True
    audio_type: Optional[str] = "computer"
    allow_join_anytime: Optional[bool] = True
    mute_participants_on_entry: Optional[bool] = False
    invitees: Optional[str] = None
    host: Optional[UserResponse] = None


    @computed_field
    @property
    def topic(self) -> str:
        return self.title

    @computed_field
    @property
    def scheduled_start_time(self) -> datetime:
        return self.start_time

    model_config = ConfigDict(from_attributes=True)


class MeetingDetailResponse(MeetingResponse):
    host: Optional[UserResponse] = None
    participants: List[ParticipantResponse] = []

    model_config = ConfigDict(from_attributes=True)


class LiveKitTokenRequest(BaseModel):
    display_name: str
    user_id: Optional[str] = None
    passcode: Optional[str] = None


class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
    room_name: str
    participant_identity: str
    participant_name: str
    is_host: bool

