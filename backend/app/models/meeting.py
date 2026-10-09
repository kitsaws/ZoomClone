from datetime import datetime
import enum
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import TimeStampedModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.participant import MeetingParticipant
    from app.models.join_request import JoinRequest


class MeetingStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


class Meeting(TimeStampedModel):
    __tablename__ = "meetings"

    meeting_number: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    host_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    passcode: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[MeetingStatus] = mapped_column(
        Enum(MeetingStatus),
        default=MeetingStatus.SCHEDULED,
        nullable=False,
        index=True
    )
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    invite_link: Mapped[str] = mapped_column(String(500), nullable=False)

    # Advanced schedule and security parameters
    timezone: Mapped[str] = mapped_column(String(100), default="India (GMT+5:30)", nullable=False)
    repeat_interval: Mapped[str] = mapped_column(String(50), default="never", nullable=False)
    use_pmi: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    waiting_room_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_chat_before_after: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    host_video_on: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    participant_video_on: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    audio_type: Mapped[str] = mapped_column(String(30), default="computer", nullable=False)
    allow_join_anytime: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    mute_participants_on_entry: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    invitees: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    host: Mapped["User"] = relationship("User", back_populates="hosted_meetings")
    participants: Mapped[List["MeetingParticipant"]] = relationship(
        "MeetingParticipant",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )
    join_requests: Mapped[List["JoinRequest"]] = relationship(
        "JoinRequest",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )
