from datetime import datetime, timedelta
import uuid
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.meeting import Meeting, MeetingStatus
from app.models.participant import MeetingParticipant, ParticipantRole, ParticipantStatus
from app.models.join_request import JoinRequest, JoinRequestStatus


def migrate_schema():
    """Adds missing columns dynamically to existing SQLite tables if not present."""
    with engine.connect() as conn:
        try:
            # 1. Users table
            res = conn.exec_driver_sql("PRAGMA table_info(users);").fetchall()
            col_names = [r[1] for r in res]
            if col_names and "pmi" not in col_names:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN pmi VARCHAR(20);")
                conn.commit()

            # 2. Meetings table
            res = conn.exec_driver_sql("PRAGMA table_info(meetings);").fetchall()
            meeting_cols = [r[1] for r in res]
            if meeting_cols:
                cols_to_add = [
                    ("timezone", "VARCHAR(100) DEFAULT 'India (GMT+5:30)'"),
                    ("repeat_interval", "VARCHAR(50) DEFAULT 'never'"),
                    ("use_pmi", "BOOLEAN DEFAULT 0"),
                    ("waiting_room_enabled", "BOOLEAN DEFAULT 0"),
                    ("allow_chat_before_after", "BOOLEAN DEFAULT 1"),
                    ("host_video_on", "BOOLEAN DEFAULT 1"),
                    ("participant_video_on", "BOOLEAN DEFAULT 1"),
                    ("audio_type", "VARCHAR(30) DEFAULT 'computer'"),
                    ("allow_join_anytime", "BOOLEAN DEFAULT 1"),
                    ("mute_participants_on_entry", "BOOLEAN DEFAULT 0"),
                    ("invitees", "TEXT"),
                ]
                for col, col_type in cols_to_add:
                    if col not in meeting_cols:
                        conn.exec_driver_sql(f"ALTER TABLE meetings ADD COLUMN {col} {col_type};")
                        conn.commit()

            # 3. Ensure meeting_number index is non-unique (so PMIs can be reused across scheduled calls)
            conn.exec_driver_sql("DROP INDEX IF EXISTS ix_meetings_meeting_number;")
            conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_meetings_meeting_number ON meetings (meeting_number);")
            conn.commit()
        except Exception as e:
            print(f"[WARN] Schema migration note: {e}")



def seed_database(db: Session = None):
    # Apply schema migrations & Ensure tables exist
    migrate_schema()
    Base.metadata.create_all(bind=engine)
    
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # Check if users already exist
        existing_users = db.query(User).all()
        if len(existing_users) > 0:
            pmi_map = {
                "swastik@zoom.test": "591 793 6498",
                "alex@zoom.test": "482 910 2938",
                "sarah@zoom.test": "719 304 8192",
                "david@zoom.test": "630 192 8401",
            }
            updated = False
            for u in existing_users:
                if not u.pmi and u.email in pmi_map:
                    u.pmi = pmi_map[u.email]
                    updated = True
                elif not u.pmi:
                    import random
                    u.pmi = f"{random.randint(100, 999)} {random.randint(100, 999)} {random.randint(1000, 9999)}"
                    updated = True
            if updated:
                db.commit()
                print("[INFO] Backfilled PMI for existing seeded users.")
            print("[INFO] Database already seeded. Skipping full seed execution.")
            return

        print("[INFO] Seeding database with Zoom Clone user personas...")

        # 1. Seed Users (Personas)
        users = [
            User(
                id=str(uuid.uuid4()),
                email="swastik@zoom.test",
                display_name="Swastik Nagpal",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                pmi="591 793 6498",
                is_default=True,
            ),
            User(
                id=str(uuid.uuid4()),
                email="alex@zoom.test",
                display_name="Alex Chen",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                pmi="482 910 2938",
                is_default=False,
            ),
            User(
                id=str(uuid.uuid4()),
                email="sarah@zoom.test",
                display_name="Sarah Jenkins",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                pmi="719 304 8192",
                is_default=False,
            ),
            User(
                id=str(uuid.uuid4()),
                email="david@zoom.test",
                display_name="David Miller",
                avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                pmi="630 192 8401",
                is_default=False,
            ),
        ]
        db.add_all(users)
        db.commit()

        print("[SUCCESS] Seed data successfully populated:")
        print(f" - {len(users)} Users created (Default: Swastik Nagpal)")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to seed database: {e}")
        raise e
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    seed_database()

