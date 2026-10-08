import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.join_request import JoinRequest, JoinRequestStatus
from app.models.participant import MeetingParticipant, ParticipantRole, ParticipantStatus
from app.repositories.join_request_repo import join_request_repo
from app.repositories.meeting_repo import meeting_repo
from app.repositories.participant_repo import participant_repo
from app.schemas.join_request import JoinRequestCreate, JoinRequestRespond
from app.core.exceptions import NotFoundException, BadRequestException


class JoinRequestService:
    def get_pending_requests(self, db: Session, meeting_id: str) -> List[JoinRequest]:
        meeting = meeting_repo.get_by_id(db, meeting_id)
        if not meeting:
            raise NotFoundException(f"Meeting '{meeting_id}' not found.")
        return join_request_repo.get_pending_by_meeting(db, meeting_id)

    def create_join_request(
        self,
        db: Session,
        meeting_id_or_number: str,
        payload: JoinRequestCreate
    ) -> JoinRequest:
        meeting = meeting_repo.get_by_id(db, meeting_id_or_number)
        if not meeting:
            meeting = meeting_repo.get_by_number(db, meeting_id_or_number)
        if not meeting:
            raise NotFoundException(f"Meeting '{meeting_id_or_number}' not found.")

        req_data = {
            "id": str(uuid.uuid4()),
            "meeting_id": meeting.id,
            "user_id": payload.user_id,
            "display_name": payload.display_name.strip(),
            "status": JoinRequestStatus.PENDING,
            "requested_at": datetime.utcnow(),
        }
        return join_request_repo.create(db, req_data)

    def respond_to_request(
        self,
        db: Session,
        request_id: str,
        payload: JoinRequestRespond
    ) -> JoinRequest:
        req = join_request_repo.get_by_id(db, request_id)
        if not req:
            raise NotFoundException(f"Join request '{request_id}' not found.")

        updated_req = join_request_repo.respond(db, request_id, payload.status)

        # If accepted, admit user/guest into the meeting
        if payload.status == JoinRequestStatus.ACCEPTED:
            participant_data = {
                "id": str(uuid.uuid4()),
                "meeting_id": req.meeting_id,
                "user_id": req.user_id,
                "display_name": req.display_name,
                "role": ParticipantRole.PARTICIPANT,
                "status": ParticipantStatus.IN_MEETING,
                "is_guest": req.user_id is None,
                "is_audio_muted": False,
                "is_video_off": False,
                "is_hand_raised": False,
                "joined_at": datetime.utcnow(),
            }
            participant_repo.create(db, participant_data)

        return updated_req


join_request_service = JoinRequestService()
