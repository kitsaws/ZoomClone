from datetime import datetime, timedelta
import uuid
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.meeting import Meeting, MeetingStatus
from app.models.participant import MeetingParticipant, ParticipantRole, ParticipantStatus
from app.models.join_request import JoinRequest, JoinRequestStatus


def seed_database(db: Session = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("[INFO] Database already seeded. Skipping seed execution.")
            return

        print("[INFO] Seeding database with realistic Zoom Clone test data...")

        # 1. Seed Users (Personas)
        users = [
            User(
                id=str(uuid.uuid4()),
                email="swastik@zoom.test",
                display_name="Swastik Nagpal",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                is_default=True,
            ),
            User(
                id=str(uuid.uuid4()),
                email="alex@zoom.test",
                display_name="Alex Chen",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                is_default=False,
            ),
            User(
                id=str(uuid.uuid4()),
                email="sarah@zoom.test",
                display_name="Sarah Jenkins",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                is_default=False,
            ),
            User(
                id=str(uuid.uuid4()),
                email="david@zoom.test",
                display_name="David Miller",
                avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                is_default=False,
            ),
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)

        u_swastik, u_alex, u_sarah, u_david = users

        now = datetime.utcnow()

        # 2. Seed Meetings
        # Meeting 1: Active Meeting with in-room participants & pending join request
        m1_id = str(uuid.uuid4())
        m1 = Meeting(
            id=m1_id,
            meeting_number="849 2018 3921",
            title="Sprint 24 Architecture Review & WebRTC Planning",
            description="Live sync for reviewing system architecture, API boundaries, and real-time signaling design.",
            host_id=u_swastik.id,
            passcode="849201",
            status=MeetingStatus.ACTIVE,
            start_time=now - timedelta(minutes=15),
            duration_minutes=45,
            invite_link="/meeting/84920183921",
        )

        # Meeting 2: Upcoming Scheduled Meeting 1
        m2_id = str(uuid.uuid4())
        m2 = Meeting(
            id=m2_id,
            meeting_number="392 4810 5928",
            title="Scaler AI — Weekly Fullstack Sync",
            description="Discussing frontend design tokens, Zoom UI alignment, and testing strategies.",
            host_id=u_swastik.id,
            passcode="392481",
            status=MeetingStatus.SCHEDULED,
            start_time=now + timedelta(hours=14),
            duration_minutes=60,
            invite_link="/meeting/39248105928",
        )

        # Meeting 3: Upcoming Scheduled Meeting 2
        m3_id = str(uuid.uuid4())
        m3 = Meeting(
            id=m3_id,
            meeting_number="718 2940 1823",
            title="Product Design & UX Teardown",
            description="Reviewing Zoom dark mode color palette, video grid responsiveness, and toolbar interactions.",
            host_id=u_alex.id,
            passcode="718294",
            status=MeetingStatus.SCHEDULED,
            start_time=now + timedelta(hours=28),
            duration_minutes=30,
            invite_link="/meeting/71829401823",
        )

        # Meeting 4: Past Meeting 1
        m4_id = str(uuid.uuid4())
        m4 = Meeting(
            id=m4_id,
            meeting_number="102 9384 5721",
            title="Backend Scaffolding & SQLite Benchmarks",
            description="Initial kick-off call for SQLAlchemy 2.0 ORM modeling and database seed design.",
            host_id=u_swastik.id,
            passcode="102938",
            status=MeetingStatus.ENDED,
            start_time=now - timedelta(days=1, hours=3),
            duration_minutes=45,
            invite_link="/meeting/10293845721",
        )

        # Meeting 5: Past Meeting 2
        m5_id = str(uuid.uuid4())
        m5 = Meeting(
            id=m5_id,
            meeting_number="592 1048 3729",
            title="Project Kickoff & Problem Statement Review",
            description="Deep-dive into the 24-hour engineering mission constraints and evaluation rubrics.",
            host_id=u_sarah.id,
            passcode="592104",
            status=MeetingStatus.ENDED,
            start_time=now - timedelta(days=2, hours=5),
            duration_minutes=30,
            invite_link="/meeting/59210483729",
        )

        db.add_all([m1, m2, m3, m4, m5])
        db.commit()

        # 3. Seed Participants
        # Active Meeting (M1) Participants
        m1_participants = [
            MeetingParticipant(
                id=str(uuid.uuid4()),
                meeting_id=m1.id,
                user_id=u_swastik.id,
                display_name="Swastik Nagpal (Host)",
                role=ParticipantRole.HOST,
                status=ParticipantStatus.IN_MEETING,
                is_guest=False,
                is_audio_muted=False,
                is_video_off=False,
                joined_at=now - timedelta(minutes=15),
            ),
            MeetingParticipant(
                id=str(uuid.uuid4()),
                meeting_id=m1.id,
                user_id=u_alex.id,
                display_name="Alex Chen",
                role=ParticipantRole.PARTICIPANT,
                status=ParticipantStatus.IN_MEETING,
                is_guest=False,
                is_audio_muted=True,
                is_video_off=False,
                joined_at=now - timedelta(minutes=12),
            ),
            MeetingParticipant(
                id=str(uuid.uuid4()),
                meeting_id=m1.id,
                user_id=u_sarah.id,
                display_name="Sarah Jenkins",
                role=ParticipantRole.PARTICIPANT,
                status=ParticipantStatus.IN_MEETING,
                is_guest=False,
                is_audio_muted=False,
                is_video_off=False,
                joined_at=now - timedelta(minutes=10),
            ),
        ]

        # Past Meeting (M4) Participants
        m4_participants = [
            MeetingParticipant(
                id=str(uuid.uuid4()),
                meeting_id=m4.id,
                user_id=u_swastik.id,
                display_name="Swastik Nagpal",
                role=ParticipantRole.HOST,
                status=ParticipantStatus.LEFT,
                is_guest=False,
                joined_at=now - timedelta(days=1, hours=3),
                left_at=now - timedelta(days=1, hours=2, minutes=15),
            ),
            MeetingParticipant(
                id=str(uuid.uuid4()),
                meeting_id=m4.id,
                user_id=u_sarah.id,
                display_name="Sarah Jenkins",
                role=ParticipantRole.PARTICIPANT,
                status=ParticipantStatus.LEFT,
                is_guest=False,
                joined_at=now - timedelta(days=1, hours=3),
                left_at=now - timedelta(days=1, hours=2, minutes=15),
            ),
            MeetingParticipant(
                id=str(uuid.uuid4()),
                meeting_id=m4.id,
                user_id=u_david.id,
                display_name="David Miller",
                role=ParticipantRole.PARTICIPANT,
                status=ParticipantStatus.LEFT,
                is_guest=False,
                joined_at=now - timedelta(days=1, hours=3),
                left_at=now - timedelta(days=1, hours=2, minutes=20),
            ),
        ]

        db.add_all(m1_participants + m4_participants)

        # 4. Seed Join Request for M1 (David Miller in waiting room)
        jr1 = JoinRequest(
            id=str(uuid.uuid4()),
            meeting_id=m1.id,
            user_id=u_david.id,
            display_name="David Miller",
            status=JoinRequestStatus.PENDING,
            requested_at=now - timedelta(minutes=2),
        )
        db.add(jr1)

        db.commit()
        print("[SUCCESS] Seed data successfully populated:")
        print(f" - {len(users)} Users created (Default: {u_swastik.display_name})")
        print(" - 5 Meetings created (1 ACTIVE, 2 SCHEDULED, 2 ENDED)")
        print(f" - {len(m1_participants)} In-Meeting Participants for active room {m1.meeting_number}")
        print(f" - 1 Pending Join Request (Waiting Room: {jr1.display_name})")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to seed database: {e}")
        raise e
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    seed_database()
