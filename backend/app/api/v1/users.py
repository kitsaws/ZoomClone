from typing import List, Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserResponse, UserSignInRequest, UserCreate
from app.services.user_service import user_service

router = APIRouter(prefix="/users", tags=["Users & Personas"])


@router.get("", response_model=List[UserResponse], summary="List all seeded test personas")
def list_users(db: Session = Depends(get_db)):
    """Returns all 4 seeded personas to populate persona switchers and demo dropdowns."""
    return user_service.get_all_users(db)


@router.get("/current", response_model=UserResponse, summary="Get current active user persona")
def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
):
    """
    Returns the active user persona.
    If X-User-Id header is passed from the client, returns that specific user.
    Otherwise, returns the system default seeded user.
    """
    if x_user_id:
        return user_service.get_user_by_id(db, x_user_id)
    return user_service.get_current_user(db)


@router.post("/signin", response_model=UserResponse, summary="Simulated email signin")
def signin_by_email(payload: UserSignInRequest, db: Session = Depends(get_db)):
    """
    Simulates signing in with email for multi-device testing.
    Looks up seeded accounts (e.g. swastik@zoom.test, alex@zoom.test).
    """
    return user_service.signin_by_email(db, payload)


@router.post("/switch/{user_id}", response_model=UserResponse, summary="Switch active default persona")
def switch_default_user(user_id: str, db: Session = Depends(get_db)):
    """Switches the active default user in the database."""
    return user_service.switch_user(db, user_id)
