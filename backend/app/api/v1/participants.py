from typing import List, Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.participant import (
    ParticipantResponse,
    ParticipantJoinRequest,
    ParticipantStateUpdate,
)
from app.services.participant_service import participant_service

router = APIRouter(prefix="/meetings/{meeting_id}/participants", tags=["Participants"])


@router.get("", response_model=List[ParticipantResponse], summary="List in-room participants")
def get_meeting_participants(meeting_id: str, db: Session = Depends(get_db)):
    """Returns all participants currently in the specified meeting."""
    return participant_service.get_participants(db, meeting_id)


@router.post("/join", response_model=ParticipantResponse, summary="Join meeting as registered user or guest")
def join_meeting(
    meeting_id: str,
    payload: ParticipantJoinRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    Joins the meeting.
    If payload.user_id is None and X-User-Id is passed, uses X-User-Id.
    If both are None, joins as an anonymous Guest.
    """
    if not payload.user_id and x_user_id:
        payload.user_id = x_user_id
    return participant_service.join_meeting(db, meeting_id, payload)


@router.post("/{participant_id}/leave", response_model=ParticipantResponse, summary="Leave meeting")
def leave_meeting(
    meeting_id: str,
    participant_id: str,
    db: Session = Depends(get_db)
):
    """Marks the participant as LEFT and records the exit timestamp."""
    return participant_service.leave_meeting(db, participant_id, meeting_id=meeting_id)


@router.patch("/{participant_id}/state", response_model=ParticipantResponse, summary="Update participant mute/video state")
def update_participant_state(
    meeting_id: str,
    participant_id: str,
    payload: ParticipantStateUpdate,
    db: Session = Depends(get_db)
):
    """Toggles audio mute, video off, hand raise, or role state."""
    return participant_service.update_participant_state(db, participant_id, payload, meeting_id=meeting_id)

