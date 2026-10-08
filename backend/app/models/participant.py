from datetime import datetime
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import TimeStampedModel

if TYPE_CHECKING:
    from app.models.meeting import Meeting
    from app.models.user import User


class ParticipantRole(str, enum.Enum):
    HOST = "HOST"
    CO_HOST = "CO_HOST"
    PARTICIPANT = "PARTICIPANT"


class ParticipantStatus(str, enum.Enum):
    WAITING = "WAITING"
    IN_MEETING = "IN_MEETING"
    LEFT = "LEFT"
    REMOVED = "REMOVED"


class MeetingParticipant(TimeStampedModel):
    __tablename__ = "meeting_participants"

    meeting_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[ParticipantRole] = mapped_column(
        Enum(ParticipantRole),
        default=ParticipantRole.PARTICIPANT,
        nullable=False
    )
    status: Mapped[ParticipantStatus] = mapped_column(
        Enum(ParticipantStatus),
        default=ParticipantStatus.IN_MEETING,
        nullable=False,
        index=True
    )
    is_guest: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_audio_muted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_video_off: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_hand_raised: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    left_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="participants")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="participations")
