from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.participant import MeetingParticipant, ParticipantStatus, ParticipantRole


class ParticipantRepository:
    @staticmethod
    def get_by_id(db: Session, participant_id: str) -> Optional[MeetingParticipant]:
        return db.scalar(select(MeetingParticipant).where(MeetingParticipant.id == participant_id))

    @staticmethod
    def get_by_meeting_and_user(
        db: Session,
        meeting_id: str,
        user_id: str
    ) -> Optional[MeetingParticipant]:
        return db.scalar(
            select(MeetingParticipant).where(
                MeetingParticipant.meeting_id == meeting_id,
                MeetingParticipant.user_id == user_id,
                MeetingParticipant.status == ParticipantStatus.IN_MEETING
            )
        )

    @staticmethod
    def get_meeting_participants(
        db: Session,
        meeting_id: str,
        status: Optional[ParticipantStatus] = None
    ) -> List[MeetingParticipant]:
        query = select(MeetingParticipant).where(MeetingParticipant.meeting_id == meeting_id)
        if status:
            query = query.where(MeetingParticipant.status == status)
        query = query.order_by(MeetingParticipant.joined_at.asc())
        return list(db.scalars(query).all())

    @staticmethod
    def create(db: Session, data: dict) -> MeetingParticipant:
        participant = MeetingParticipant(**data)
        db.add(participant)
        db.commit()
        db.refresh(participant)
        return participant

    @staticmethod
    def update_state(db: Session, participant_id: str, updates: dict) -> Optional[MeetingParticipant]:
        participant = db.scalar(select(MeetingParticipant).where(MeetingParticipant.id == participant_id))
        if participant:
            for key, val in updates.items():
                if val is not None and hasattr(participant, key):
                    setattr(participant, key, val)
            db.commit()
            db.refresh(participant)
        return participant

    @staticmethod
    def mark_left(db: Session, participant_id: str) -> Optional[MeetingParticipant]:
        participant = db.scalar(select(MeetingParticipant).where(MeetingParticipant.id == participant_id))
        if participant:
            participant.status = ParticipantStatus.LEFT
            participant.left_at = datetime.utcnow()
            db.commit()
            db.refresh(participant)
        return participant


participant_repo = ParticipantRepository()
