from datetime import datetime
import random
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.meeting import Meeting, MeetingStatus
from app.models.participant import MeetingParticipant, ParticipantRole, ParticipantStatus
from app.repositories.meeting_repo import meeting_repo
from app.repositories.participant_repo import participant_repo
from app.repositories.user_repo import user_repo
from app.schemas.meeting import InstantMeetingCreate, ScheduleMeetingCreate, MeetingResponse, MeetingDetailResponse
from app.core.exceptions import NotFoundException, BadRequestException


class MeetingService:
    @staticmethod
    def generate_meeting_number(db: Session) -> str:
        """Generates a unique 10-digit formatted Zoom meeting number (e.g. '849 2018 3921')."""
        for _ in range(10):
            p1 = random.randint(100, 999)
            p2 = random.randint(1000, 9999)
            p3 = random.randint(1000, 9999)
            formatted = f"{p1} {p2} {p3}"
            if not meeting_repo.get_by_number(db, formatted):
                return formatted
        # Fallback with timestamp digits
        ts = str(int(datetime.utcnow().timestamp()))[-10:]
        return f"{ts[:3]} {ts[3:7]} {ts[7:]}"

    def create_instant_meeting(
        self,
        db: Session,
        payload: InstantMeetingCreate,
        current_user_id: Optional[str] = None
    ) -> Meeting:
        # Determine host ID
        host_id = payload.host_id or current_user_id
        if not host_id:
            default_user = user_repo.get_default_user(db)
            if not default_user:
                raise BadRequestException("No host user available. Please sign in or seed users.")
            host_id = default_user.id

        host_user = user_repo.get_by_id(db, host_id)
        if not host_user:
            raise NotFoundException(f"Host user with id '{host_id}' not found.")

        meeting_id = str(uuid.uuid4())
        meeting_number = self.generate_meeting_number(db)
        clean_number = meeting_number.replace(" ", "")

        meeting_data = {
            "id": meeting_id,
            "meeting_number": meeting_number,
            "title": payload.title or f"{host_user.display_name}'s Personal Meeting Room",
            "description": "Instant Zoom Meeting",
            "host_id": host_id,
            "passcode": payload.passcode or str(random.randint(100000, 999999)),
            "status": MeetingStatus.ACTIVE,
            "start_time": datetime.utcnow(),
            "duration_minutes": 45,
            "invite_link": f"/meeting/{clean_number}",
        }

        meeting = meeting_repo.create(db, meeting_data)

        # Create Host as first participant
        host_participant_data = {
            "id": str(uuid.uuid4()),
            "meeting_id": meeting.id,
            "user_id": host_user.id,
            "display_name": f"{host_user.display_name} (Host)",
            "role": ParticipantRole.HOST,
            "status": ParticipantStatus.IN_MEETING,
            "is_guest": False,
            "is_audio_muted": False,
            "is_video_off": False,
            "joined_at": datetime.utcnow(),
        }
        participant_repo.create(db, host_participant_data)

        return meeting

    def schedule_meeting(
        self,
        db: Session,
        payload: ScheduleMeetingCreate,
        current_user_id: Optional[str] = None
    ) -> Meeting:
        host_id = payload.host_id or current_user_id
        if not host_id:
            default_user = user_repo.get_default_user(db)
            if not default_user:
                raise BadRequestException("No host user available. Please sign in or seed users.")
            host_id = default_user.id

        host_user = user_repo.get_by_id(db, host_id)
        if not host_user:
            raise NotFoundException(f"Host user with id '{host_id}' not found.")

        meeting_id = str(uuid.uuid4())
        meeting_number = self.generate_meeting_number(db)
        clean_number = meeting_number.replace(" ", "")

        meeting_data = {
            "id": meeting_id,
            "meeting_number": meeting_number,
            "title": payload.title,
            "description": payload.description,
            "host_id": host_id,
            "passcode": payload.passcode or str(random.randint(100000, 999999)),
            "status": MeetingStatus.SCHEDULED,
            "start_time": payload.start_time,
            "duration_minutes": payload.duration_minutes,
            "invite_link": f"/meeting/{clean_number}",
        }

        return meeting_repo.create(db, meeting_data)

    def get_meeting_by_id_or_number(self, db: Session, id_or_number: str) -> Meeting:
        # Check UUID
        meeting = meeting_repo.get_by_id(db, id_or_number, load_relations=True)
        if not meeting:
            # Check meeting number
            meeting = meeting_repo.get_by_number(db, id_or_number)
            if meeting:
                meeting = meeting_repo.get_by_id(db, meeting.id, load_relations=True)

        if not meeting:
            raise NotFoundException(f"Meeting '{id_or_number}' not found.")
        return meeting

    def get_upcoming_meetings(self, db: Session) -> List[Meeting]:
        meetings = meeting_repo.get_upcoming(db)
        return meetings

    def get_recent_meetings(self, db: Session) -> List[Meeting]:
        meetings = meeting_repo.get_recent(db)
        return meetings

    def start_meeting(self, db: Session, meeting_id: str, user_id: Optional[str] = None) -> Meeting:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            raise NotFoundException(f"Meeting '{meeting_id}' not found.")

        if meeting.status == MeetingStatus.ENDED:
            raise BadRequestException("Cannot start an ended meeting.")

        meeting = meeting_repo.update_status(db, meeting_id, MeetingStatus.ACTIVE)
        return meeting

    def end_meeting(self, db: Session, meeting_id: str, user_id: Optional[str] = None) -> Meeting:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            raise NotFoundException(f"Meeting '{meeting_id}' not found.")

        # Transition meeting state
        meeting = meeting_repo.update_status(db, meeting_id, MeetingStatus.ENDED)

        # Mark all active participants as LEFT
        participants = participant_repo.get_meeting_participants(db, meeting_id, status=ParticipantStatus.IN_MEETING)
        for p in participants:
            participant_repo.mark_left(db, p.id)

        return meeting


meeting_service = MeetingService()
