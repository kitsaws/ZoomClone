from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import TimeStampedModel

if TYPE_CHECKING:
    from app.models.meeting import Meeting
    from app.models.participant import MeetingParticipant
    from app.models.join_request import JoinRequest


class User(TimeStampedModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    hosted_meetings: Mapped[List["Meeting"]] = relationship(
        "Meeting",
        back_populates="host",
        cascade="all, delete-orphan"
    )
    participations: Mapped[List["MeetingParticipant"]] = relationship(
        "MeetingParticipant",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    join_requests: Mapped[List["JoinRequest"]] = relationship(
        "JoinRequest",
        back_populates="user",
        cascade="all, delete-orphan"
    )
