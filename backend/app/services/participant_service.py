import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.meeting import Meeting, MeetingStatus
from app.models.participant import MeetingParticipant, ParticipantRole, ParticipantStatus
from app.repositories.meeting_repo import meeting_repo
from app.repositories.participant_repo import participant_repo
from app.repositories.user_repo import user_repo
from app.schemas.participant import ParticipantJoinRequest, ParticipantStateUpdate
from app.core.exceptions import NotFoundException, BadRequestException


class ParticipantService:
    def get_participants(self, db: Session, meeting_id: str) -> List[MeetingParticipant]:
        # Validate meeting exists
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            raise NotFoundException(f"Meeting '{meeting_id}' not found.")
        return participant_repo.get_meeting_participants(db, meeting_id, status=ParticipantStatus.IN_MEETING)

    def join_meeting(
        self,
        db: Session,
        meeting_id_or_number: str,
        payload: ParticipantJoinRequest
    ) -> MeetingParticipant:
        # Resolve meeting by ID or number
        meeting = meeting_repo.get_by_id(db, meeting_id_or_number)
        if not meeting:
            meeting = meeting_repo.get_by_number(db, meeting_id_or_number)
        if not meeting:
            raise NotFoundException(f"Meeting '{meeting_id_or_number}' not found.")

        if meeting.status == MeetingStatus.ENDED:
            raise BadRequestException("This meeting has already ended.")

        # If meeting was SCHEDULED, transition to ACTIVE on first join
        if meeting.status == MeetingStatus.SCHEDULED:
            meeting_repo.update_status(db, meeting.id, MeetingStatus.ACTIVE)

        # Check if registered user or guest
        user_id = payload.user_id
        is_guest = True
        display_name = payload.display_name.strip()
        role = ParticipantRole.PARTICIPANT

        if user_id:
            user = user_repo.get_by_id(db, user_id)
            if user:
                is_guest = False
                display_name = payload.display_name or user.display_name
                if user.id == meeting.host_id:
                    role = ParticipantRole.HOST

                # Check if already active in this meeting
                existing = participant_repo.get_by_meeting_and_user(db, meeting.id, user.id)
                if existing:
                    return existing

        # Create new participant
        participant_data = {
            "id": str(uuid.uuid4()),
            "meeting_id": meeting.id,
            "user_id": user_id if not is_guest else None,
            "display_name": display_name,
            "role": role,
            "status": ParticipantStatus.IN_MEETING,
            "is_guest": is_guest,
            "is_audio_muted": payload.is_audio_muted,
            "is_video_off": payload.is_video_off,
            "is_hand_raised": False,
            "joined_at": datetime.utcnow(),
        }

        return participant_repo.create(db, participant_data)

    def leave_meeting(self, db: Session, participant_id: str) -> MeetingParticipant:
        participant = participant_repo.get_by_id(db, participant_id)
        if not participant:
            raise NotFoundException(f"Participant '{participant_id}' not found.")
        return participant_repo.mark_left(db, participant_id)

    def update_participant_state(
        self,
        db: Session,
        participant_id: str,
        payload: ParticipantStateUpdate
    ) -> MeetingParticipant:
        participant = participant_repo.get_by_id(db, participant_id)
        if not participant:
            raise NotFoundException(f"Participant '{participant_id}' not found.")

        updates = payload.model_dump(exclude_unset=True)
        return participant_repo.update_state(db, participant_id, updates)


participant_service = ParticipantService()
