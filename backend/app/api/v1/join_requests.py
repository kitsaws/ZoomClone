from typing import List, Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.join_request import (
    JoinRequestResponse,
    JoinRequestCreate,
    JoinRequestRespond,
)
from app.services.join_request_service import join_request_service

router = APIRouter(prefix="/meetings/{meeting_id}/requests", tags=["Waiting Room & Join Requests"])


@router.get("", response_model=List[JoinRequestResponse], summary="List pending waiting room requests")
def list_join_requests(meeting_id: str, db: Session = Depends(get_db)):
    """Returns all pending join requests for the host to review."""
    return join_request_service.get_pending_requests(db, meeting_id)


@router.post("", response_model=JoinRequestResponse, status_code=status.HTTP_201_CREATED, summary="Submit request to join waiting room")
def create_join_request(
    meeting_id: str,
    payload: JoinRequestCreate,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """Submits user or guest to the meeting waiting room."""
    if not payload.user_id and x_user_id:
        payload.user_id = x_user_id
    return join_request_service.create_join_request(db, meeting_id, payload)


@router.post("/{request_id}/respond", response_model=JoinRequestResponse, summary="Host admit or reject join request")
def respond_to_join_request(
    meeting_id: str,
    request_id: str,
    payload: JoinRequestRespond,
    db: Session = Depends(get_db)
):
    """Host accepts (admits into room) or rejects the waiting participant."""
    return join_request_service.respond_to_request(db, request_id, payload)
