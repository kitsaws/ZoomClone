from typing import List, Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.meeting_repo import meeting_repo
from app.schemas.meeting import (
    InstantMeetingCreate,
    ScheduleMeetingCreate,
    MeetingResponse,
    MeetingDetailResponse,
)
from app.services.meeting_service import meeting_service

router = APIRouter(prefix="/meetings", tags=["Meetings"])


def _with_count(db: Session, meeting) -> MeetingResponse:
    res = MeetingResponse.model_validate(meeting)
    res.participant_count = meeting_repo.get_participant_count(db, meeting.id)
    return res


@router.get("/upcoming", response_model=List[MeetingResponse], summary="Fetch upcoming scheduled meetings")
def get_upcoming_meetings(db: Session = Depends(get_db)):
    """Returns scheduled and active meetings sorted by start time."""
    meetings = meeting_service.get_upcoming_meetings(db)
    return [_with_count(db, m) for m in meetings]


@router.get("/recent", response_model=List[MeetingResponse], summary="Fetch past / ended meetings")
def get_recent_meetings(db: Session = Depends(get_db)):
    """Returns past ended meetings sorted by updated time."""
    meetings = meeting_service.get_recent_meetings(db)
    return [_with_count(db, m) for m in meetings]


@router.post("/instant", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED, summary="Create an instant live meeting")
def create_instant_meeting(
    payload: InstantMeetingCreate,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Creates a new instant meeting in ACTIVE status and registers the host in the meeting."""
    meeting = meeting_service.create_instant_meeting(db, payload, current_user_id=x_user_id)
    return _with_count(db, meeting)


@router.post("/schedule", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED, summary="Schedule a new meeting")
def schedule_meeting(
    payload: ScheduleMeetingCreate,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Schedules a new meeting in SCHEDULED status with date, time, and duration."""
    meeting = meeting_service.schedule_meeting(db, payload, current_user_id=x_user_id)
    return _with_count(db, meeting)


@router.get("/{id_or_number}", response_model=MeetingDetailResponse, summary="Get meeting details by ID or 10-digit number")
def get_meeting(id_or_number: str, db: Session = Depends(get_db)):
    """Resolves meeting by UUID or 10-digit formatted number (e.g. '849 2018 3921' or '84920183921')."""
    meeting = meeting_service.get_meeting_by_id_or_number(db, id_or_number)
    res = MeetingDetailResponse.model_validate(meeting)
    res.participant_count = meeting_repo.get_participant_count(db, meeting.id)
    return res


@router.post("/{meeting_id}/start", response_model=MeetingResponse, summary="Start a scheduled meeting")
def start_meeting(
    meeting_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Transitions a meeting from SCHEDULED to ACTIVE status."""
    meeting = meeting_service.start_meeting(db, meeting_id, user_id=x_user_id)
    return _with_count(db, meeting)


@router.post("/{meeting_id}/end", response_model=MeetingResponse, summary="End meeting for all participants")
def end_meeting(
    meeting_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Ends an active meeting and records exit timestamps for all participants."""
    meeting = meeting_service.end_meeting(db, meeting_id, user_id=x_user_id)
    return _with_count(db, meeting)
