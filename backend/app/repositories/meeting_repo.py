from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_, func
from app.models.meeting import Meeting, MeetingStatus
from app.models.participant import MeetingParticipant, ParticipantStatus


class MeetingRepository:
    @staticmethod
    def get_by_id(db: Session, meeting_id: str, load_relations: bool = False) -> Optional[Meeting]:
        query = select(Meeting).where(Meeting.id == meeting_id)
        if load_relations:
            query = query.options(
                joinedload(Meeting.host),
                joinedload(Meeting.participants)
            )
        return db.scalar(query)

    @staticmethod
    def get_by_number(db: Session, meeting_number: str) -> Optional[Meeting]:
        clean_number = meeting_number.replace(" ", "").replace("-", "")
        # Query with stripped spaces
        meetings = list(db.scalars(select(Meeting)).all())
        for m in meetings:
            if m.meeting_number.replace(" ", "").replace("-", "") == clean_number:
                return m
        return None

    @staticmethod
    def get_upcoming(db: Session, limit: int = 20) -> List[Meeting]:
        query = select(Meeting).options(joinedload(Meeting.host)).where(
            Meeting.status.in_([MeetingStatus.SCHEDULED, MeetingStatus.ACTIVE])
        ).order_by(Meeting.start_time.asc()).limit(limit)
        return list(db.scalars(query).all())

    @staticmethod
    def get_recent(db: Session, limit: int = 20) -> List[Meeting]:
        query = select(Meeting).options(joinedload(Meeting.host)).where(
            Meeting.status == MeetingStatus.ENDED
        ).order_by(Meeting.updated_at.desc()).limit(limit)
        return list(db.scalars(query).all())


    @staticmethod
    def create(db: Session, meeting_data: dict) -> Meeting:
        meeting = Meeting(**meeting_data)
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        return meeting

    @staticmethod
    def update_status(db: Session, meeting_id: str, status: MeetingStatus) -> Optional[Meeting]:
        meeting = db.scalar(select(Meeting).where(Meeting.id == meeting_id))
        if meeting:
            meeting.status = status
            db.commit()
            db.refresh(meeting)
        return meeting

    @staticmethod
    def get_participant_count(db: Session, meeting_id: str) -> int:
        count = db.scalar(
            select(func.count(MeetingParticipant.id)).where(
                MeetingParticipant.meeting_id == meeting_id,
                MeetingParticipant.status == ParticipantStatus.IN_MEETING
            )
        )
        return count or 0

    @staticmethod
    def delete(db: Session, meeting_id: str) -> bool:
        meeting = db.scalar(select(Meeting).where(Meeting.id == meeting_id))
        if meeting:
            db.delete(meeting)
            db.commit()
            return True
        return False


meeting_repo = MeetingRepository()


