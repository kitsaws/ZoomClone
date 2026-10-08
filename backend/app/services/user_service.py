from typing import List
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.user_repo import user_repo
from app.schemas.user import UserCreate, UserSignInRequest, UserResponse
from app.core.exceptions import NotFoundException, ConflictException


class UserService:
    def get_all_users(self, db: Session) -> List[User]:
        return user_repo.get_all(db)

    def get_current_user(self, db: Session) -> User:
        user = user_repo.get_default_user(db)
        if not user:
            raise NotFoundException("No default user found in database.")
        return user

    def get_user_by_id(self, db: Session, user_id: str) -> User:
        user = user_repo.get_by_id(db, user_id)
        if not user:
            raise NotFoundException(f"User with id '{user_id}' not found.")
        return user

    def switch_user(self, db: Session, user_id: str) -> User:
        user = user_repo.set_default_user(db, user_id)
        if not user:
            raise NotFoundException(f"User with id '{user_id}' not found.")
        return user

    def signin_by_email(self, db: Session, payload: UserSignInRequest) -> User:
        user = user_repo.get_by_email(db, payload.email)
        if not user:
            raise NotFoundException(
                f"No account found with email '{payload.email}'. "
                "Please choose from seeded demo personas (e.g. swastik@zoom.test, alex@zoom.test)."
            )
        # Also set this user as the active default persona for convenience
        user_repo.set_default_user(db, user.id)
        return user

    def create_user(self, db: Session, payload: UserCreate) -> User:
        existing = user_repo.get_by_email(db, payload.email)
        if existing:
            raise ConflictException(f"User with email '{payload.email}' already exists.")
        return user_repo.create(db, payload)


user_service = UserService()
