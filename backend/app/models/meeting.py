from datetime import datetime
import enum
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, DateTime, Enum, ForeignKey
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

    meeting_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
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
