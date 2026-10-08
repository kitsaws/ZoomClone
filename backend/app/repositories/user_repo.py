from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.scalar(select(User).where(User.id == user_id))

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.scalar(select(User).where(User.email == email.strip().lower()))

    @staticmethod
    def get_default_user(db: Session) -> Optional[User]:
        user = db.scalar(select(User).where(User.is_default == True))
        if not user:
            user = db.scalar(select(User).order_by(User.created_at.asc()))
        return user

    @staticmethod
    def set_default_user(db: Session, user_id: str) -> Optional[User]:
        # Reset current defaults
        db.execute(update(User).values(is_default=False))
        # Set new default
        user = db.scalar(select(User).where(User.id == user_id))
        if user:
            user.is_default = True
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def get_all(db: Session) -> List[User]:
        return list(db.scalars(select(User).order_by(User.created_at.asc())).all())

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        user = User(
            email=user_in.email.strip().lower(),
            display_name=user_in.display_name,
            avatar_url=user_in.avatar_url,
            is_default=user_in.is_default
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user_repo = UserRepository()
