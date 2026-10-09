from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, computed_field
from app.models.participant import ParticipantRole, ParticipantStatus


class ParticipantBase(BaseModel):
    display_name: str
    is_audio_muted: bool = False
    is_video_off: bool = False
    is_hand_raised: bool = False


class ParticipantJoinRequest(BaseModel):
    display_name: str
    user_id: Optional[str] = None  # None indicates Guest
    is_audio_muted: bool = False
    is_video_off: bool = False


class ParticipantStateUpdate(BaseModel):
    is_audio_muted: Optional[bool] = None
    is_video_off: Optional[bool] = None
    is_hand_raised: Optional[bool] = None
    role: Optional[ParticipantRole] = None
    status: Optional[ParticipantStatus] = None


class ParticipantResponse(ParticipantBase):
    id: str
    meeting_id: str
    user_id: Optional[str] = None
    role: ParticipantRole
    status: ParticipantStatus
    is_guest: bool
    joined_at: datetime
    left_at: Optional[datetime] = None

    @computed_field
    @property
    def audio_muted(self) -> bool:
        return self.is_audio_muted

    @computed_field
    @property
    def video_muted(self) -> bool:
        return self.is_video_off

    @computed_field
    @property
    def hand_raised(self) -> bool:
        return self.is_hand_raised

    @computed_field
    @property
    def is_host(self) -> bool:
        return self.role == ParticipantRole.HOST

    model_config = ConfigDict(from_attributes=True)

