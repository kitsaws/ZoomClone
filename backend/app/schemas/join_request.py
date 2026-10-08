from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.join_request import JoinRequestStatus


class JoinRequestCreate(BaseModel):
    display_name: str
    user_id: Optional[str] = None  # None for Guests


class JoinRequestRespond(BaseModel):
    status: JoinRequestStatus  # ACCEPTED or REJECTED


class JoinRequestResponse(BaseModel):
    id: str
    meeting_id: str
    user_id: Optional[str] = None
    display_name: str
    status: JoinRequestStatus
    requested_at: datetime
    responded_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
