from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)


class MeetingDetailResponse(MeetingResponse):
    host: Optional[UserResponse] = None
    participants: List[ParticipantResponse] = []

    model_config = ConfigDict(from_attributes=True)
