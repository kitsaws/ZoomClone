from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.join_request import JoinRequest, JoinRequestStatus


class JoinRequestRepository:
    @staticmethod
    def get_by_id(db: Session, request_id: str) -> Optional[JoinRequest]:
        return db.scalar(select(JoinRequest).where(JoinRequest.id == request_id))

    @staticmethod
    def get_pending_by_meeting(db: Session, meeting_id: str) -> List[JoinRequest]:
        query = select(JoinRequest).where(
            JoinRequest.meeting_id == meeting_id,
            JoinRequest.status == JoinRequestStatus.PENDING
        ).order_by(JoinRequest.requested_at.asc())
        return list(db.scalars(query).all())

    @staticmethod
    def create(db: Session, data: dict) -> JoinRequest:
        req = JoinRequest(**data)
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def respond(db: Session, request_id: str, status: JoinRequestStatus) -> Optional[JoinRequest]:
        req = db.scalar(select(JoinRequest).where(JoinRequest.id == request_id))
        if req:
            req.status = status
            req.responded_at = datetime.utcnow()
            db.commit()
            db.refresh(req)
        return req


join_request_repo = JoinRequestRepository()
