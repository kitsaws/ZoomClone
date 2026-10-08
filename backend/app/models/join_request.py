from datetime import datetime
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import TimeStampedModel

if TYPE_CHECKING:
    from app.models.meeting import Meeting
    from app.models.user import User


class JoinRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class JoinRequest(TimeStampedModel):
    __tablename__ = "join_requests"

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
    status: Mapped[JoinRequestStatus] = mapped_column(
        Enum(JoinRequestStatus),
        default=JoinRequestStatus.PENDING,
        nullable=False,
        index=True
    )
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="join_requests")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="join_requests")
