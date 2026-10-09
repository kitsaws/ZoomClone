from typing import List, Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.meeting_repo import meeting_repo
from app.schemas.meeting import (
    InstantMeetingCreate,
    ScheduleMeetingCreate,
    MeetingUniversalCreate,
    MeetingResponse,
    MeetingDetailResponse,
    LiveKitTokenRequest,
    LiveKitTokenResponse,
)
from app.services.meeting_service import meeting_service
from app.services.livekit_service import LiveKitService
from app.core.config import settings

router = APIRouter(prefix="/meetings", tags=["Meetings"])


def _with_count(db: Session, meeting) -> MeetingResponse:
    res = MeetingResponse.model_validate(meeting)
    res.participant_count = meeting_repo.get_participant_count(db, meeting.id)
    return res


@router.get("", response_model=List[MeetingResponse], summary="List meetings with optional status filter")
def list_meetings(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Returns upcoming, recent, or all meetings."""
    if status == "upcoming":
        meetings = meeting_service.get_upcoming_meetings(db)
    elif status == "recent" or status == "ended":
        meetings = meeting_service.get_recent_meetings(db)
    else:
        # By default return upcoming first, then recent
        upcoming = meeting_service.get_upcoming_meetings(db)
        recent = meeting_service.get_recent_meetings(db)
        meetings = upcoming + recent
    return [_with_count(db, m) for m in meetings]


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED, summary="Create meeting (Instant or Scheduled)")
def create_meeting(
    payload: MeetingUniversalCreate,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Creates an instant meeting or schedules a future meeting depending on whether start_time is provided."""
    meeting_title = payload.title or payload.topic or "Instant Meeting"
    start_time = payload.start_time or payload.scheduled_start_time

    if start_time:
        schedule_payload = ScheduleMeetingCreate(
            title=meeting_title,
            description=payload.description,
            start_time=start_time,
            duration_minutes=payload.duration_minutes or 30,
            host_id=payload.host_id,
            passcode=payload.passcode,
            timezone=payload.timezone or "India (GMT+5:30)",
            repeat_interval=payload.repeat_interval or "never",
            use_pmi=payload.use_pmi or False,
            waiting_room_enabled=payload.waiting_room_enabled or False,
            allow_chat_before_after=payload.allow_chat_before_after if payload.allow_chat_before_after is not None else True,
            host_video_on=payload.host_video_on if payload.host_video_on is not None else True,
            participant_video_on=payload.participant_video_on if payload.participant_video_on is not None else True,
            audio_type=payload.audio_type or "computer",
            allow_join_anytime=payload.allow_join_anytime if payload.allow_join_anytime is not None else True,
            mute_participants_on_entry=payload.mute_participants_on_entry or False,
            invitees=payload.invitees or [],
        )
        meeting = meeting_service.schedule_meeting(db, schedule_payload, current_user_id=x_user_id)
    else:
        instant_payload = InstantMeetingCreate(
            title=meeting_title,
            host_id=payload.host_id,
            passcode=payload.passcode
        )
        meeting = meeting_service.create_instant_meeting(db, instant_payload, current_user_id=x_user_id)
    return _with_count(db, meeting)


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


@router.delete("/{meeting_id}", summary="Delete a meeting by ID")
def delete_meeting(
    meeting_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Deletes a meeting from the system."""
    success = meeting_service.delete_meeting(db, meeting_id, user_id=x_user_id)
    return {"success": success, "message": "Meeting deleted successfully"}


@router.post("/{id_or_number}/token", response_model=LiveKitTokenResponse, summary="Generate scoped LiveKit access token")
def get_livekit_token(
    id_or_number: str,
    payload: LiveKitTokenRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Validates meeting existence, checks permissions/passcode, and issues a scoped LiveKit access token."""
    from fastapi import HTTPException
    import uuid

    meeting = meeting_service.get_meeting_by_id_or_number(db, id_or_number)

    # Check passcode if meeting has passcode set
    if meeting.passcode and payload.passcode and meeting.passcode != payload.passcode:
        raise HTTPException(status_code=400, detail="Invalid meeting passcode")

    user_id = payload.user_id or x_user_id
    is_host = bool(user_id and meeting.host_id and user_id == meeting.host_id)
    
    # Generate stable identity
    clean_name = payload.display_name.strip().replace(" ", "_").lower()
    participant_identity = user_id or f"guest_{uuid.uuid4().hex[:8]}_{clean_name}"

    token = LiveKitService.generate_meeting_token(
        meeting=meeting,
        identity=participant_identity,
        name=payload.display_name,
        is_host=is_host,
    )

    return LiveKitTokenResponse(
        token=token,
        url=settings.LIVEKIT_URL,
        room_name=meeting.id,
        participant_identity=participant_identity,
        participant_name=payload.display_name,
        is_host=is_host,
    )
