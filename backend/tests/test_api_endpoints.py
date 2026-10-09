from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.meeting import MeetingStatus
from app.models.participant import ParticipantRole, ParticipantStatus

client = TestClient(app)


def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"


def test_users_api():
    # 1. List users
    res = client.get("/api/v1/users")
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 4

    # 2. Get current default user
    curr = client.get("/api/v1/users/current")
    assert curr.status_code == 200
    assert curr.json()["is_default"] is True

    # 3. Signin by email
    signin = client.post("/api/v1/users/signin", json={"email": "alex@zoom.test"})
    assert signin.status_code == 200
    assert signin.json()["display_name"] == "Alex Chen"

    # 4. Signin with non-existent email -> 404
    bad_signin = client.post("/api/v1/users/signin", json={"email": "fake@nonexistent.com"})
    assert bad_signin.status_code == 404


def test_meetings_upcoming_and_recent():
    # Create an upcoming scheduled meeting
    start = (datetime.utcnow() + timedelta(days=1)).isoformat()
    client.post("/api/v1/meetings/schedule", json={
        "title": "Test Upcoming Meeting",
        "start_time": start,
        "duration_minutes": 30
    })

    # Create and end a meeting for recent
    inst_res = client.post("/api/v1/meetings/instant", json={"title": "Test Ended Meeting"})
    m_id = inst_res.json()["id"]
    client.post(f"/api/v1/meetings/{m_id}/end")

    # Fetch all meetings
    all_res = client.get("/api/v1/meetings")
    assert all_res.status_code == 200
    assert len(all_res.json()) >= 1

    # Fetch upcoming
    upcoming = client.get("/api/v1/meetings/upcoming")
    assert upcoming.status_code == 200
    up_data = upcoming.json()
    assert len(up_data) >= 1
    for m in up_data:
        assert m["status"] in ["SCHEDULED", "ACTIVE"]

    # Fetch recent
    recent = client.get("/api/v1/meetings/recent")
    assert recent.status_code == 200
    rec_data = recent.json()
    assert len(rec_data) >= 1
    for m in rec_data:
        assert m["status"] == "ENDED"



def test_flexible_meeting_creation():
    # Instant meeting via POST /api/v1/meetings
    res_inst = client.post("/api/v1/meetings", json={"topic": "Universal Instant Sync"})
    assert res_inst.status_code == 201
    assert res_inst.json()["status"] == "ACTIVE"
    assert res_inst.json()["topic"] == "Universal Instant Sync"
    assert res_inst.json()["title"] == "Universal Instant Sync"

    # Scheduled meeting via POST /api/v1/meetings
    start = (datetime.utcnow() + timedelta(days=1)).isoformat()
    res_sched = client.post("/api/v1/meetings", json={
        "topic": "Universal Scheduled Review",
        "scheduled_start_time": start,
        "duration_minutes": 60
    })
    assert res_sched.status_code == 201
    assert res_sched.json()["status"] == "SCHEDULED"



def test_instant_meeting_creation():
    payload = {
        "title": "Ad-Hoc Architecture Sync",
        "passcode": "123456"
    }
    res = client.post("/api/v1/meetings/instant", json=payload)
    assert res.status_code == 201
    meeting = res.json()
    assert meeting["status"] == "ACTIVE"
    assert len(meeting["meeting_number"].split(" ")) == 3  # e.g. 849 2018 3921
    assert meeting["participant_count"] >= 1


def test_schedule_meeting():
    start = (datetime.utcnow() + timedelta(days=2)).isoformat()
    payload = {
        "title": "Design System Review",
        "description": "Zoom UI tokens alignment",
        "start_time": start,
        "duration_minutes": 45,
        "passcode": "654321"
    }
    res = client.post("/api/v1/meetings/schedule", json=payload)
    assert res.status_code == 201
    meeting = res.json()
    assert meeting["status"] == "SCHEDULED"
    assert meeting["title"] == "Design System Review"


def test_meeting_lookup_by_number_and_id():
    # Create an active meeting
    inst_res = client.post("/api/v1/meetings/instant", json={"title": "Lookup Test Meeting"})
    created = inst_res.json()
    m_num = created["meeting_number"]

    # Lookup by formatted 10-digit number
    res = client.get(f"/api/v1/meetings/{m_num}")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ACTIVE"

    # Lookup without spaces
    clean_num = m_num.replace(" ", "")
    res_clean = client.get(f"/api/v1/meetings/{clean_num}")
    assert res_clean.status_code == 200
    assert res_clean.json()["id"] == data["id"]



def test_guest_join_flow():
    # 1. Create a meeting
    m_res = client.post("/api/v1/meetings/instant", json={"title": "Guest Test Meeting"})
    meeting_id = m_res.json()["id"]

    # 2. Join as anonymous Guest
    join_payload = {
        "display_name": "Jane Guest",
        "user_id": None,
        "is_audio_muted": True,
        "is_video_off": False
    }
    j_res = client.post(f"/api/v1/meetings/{meeting_id}/participants/join", json=join_payload)
    assert j_res.status_code == 200
    participant = j_res.json()
    assert participant["is_guest"] is True
    assert participant["user_id"] is None
    assert participant["display_name"] == "Jane Guest"
    assert participant["is_audio_muted"] is True
    assert participant["role"] == "PARTICIPANT"


def test_participant_state_toggle_and_leave():
    # Create meeting & join
    m_res = client.post("/api/v1/meetings/instant", json={"title": "State Toggle Test"})
    meeting_id = m_res.json()["id"]

    j_res = client.post(
        f"/api/v1/meetings/{meeting_id}/participants/join",
        json={"display_name": "Bob Tester", "user_id": None}
    )
    part_id = j_res.json()["id"]

    # Toggle mic & hand raise
    state_res = client.patch(
        f"/api/v1/meetings/{meeting_id}/participants/{part_id}/state",
        json={"is_audio_muted": True, "is_hand_raised": True}
    )
    assert state_res.status_code == 200
    assert state_res.json()["is_audio_muted"] is True
    assert state_res.json()["is_hand_raised"] is True

    # Leave meeting
    leave_res = client.post(f"/api/v1/meetings/{meeting_id}/participants/{part_id}/leave")
    assert leave_res.status_code == 200
    assert leave_res.json()["status"] == "LEFT"


def test_waiting_room_and_host_admission():
    # 1. Create meeting
    m_res = client.post("/api/v1/meetings/instant", json={"title": "Waiting Room Test"})
    meeting_id = m_res.json()["id"]

    # 2. Submit join request to waiting room
    req_res = client.post(
        f"/api/v1/meetings/{meeting_id}/requests",
        json={"display_name": "Waiting Guest", "user_id": None}
    )
    assert req_res.status_code == 201
    request_id = req_res.json()["id"]
    assert req_res.json()["status"] == "PENDING"

    # 3. Host lists pending requests
    list_res = client.get(f"/api/v1/meetings/{meeting_id}/requests")
    assert list_res.status_code == 200
    assert any(r["id"] == request_id for r in list_res.json())

    # 4. Host admits waiting guest
    admit_res = client.post(
        f"/api/v1/meetings/{meeting_id}/requests/{request_id}/respond",
        json={"status": "ACCEPTED"}
    )
    assert admit_res.status_code == 200
    assert admit_res.json()["status"] == "ACCEPTED"

    # 5. Verify participant is now in meeting
    parts_res = client.get(f"/api/v1/meetings/{meeting_id}/participants")
    assert parts_res.status_code == 200
    assert any(p["display_name"] == "Waiting Guest" for p in parts_res.json())


def test_meeting_lifecycle_start_and_end():
    # Schedule a meeting
    start = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    m_res = client.post(
        "/api/v1/meetings/schedule",
        json={"title": "Lifecycle Test", "start_time": start, "duration_minutes": 30}
    )
    meeting_id = m_res.json()["id"]
    assert m_res.json()["status"] == "SCHEDULED"

    # Start meeting
    start_res = client.post(f"/api/v1/meetings/{meeting_id}/start")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "ACTIVE"

    # End meeting
    end_res = client.post(f"/api/v1/meetings/{meeting_id}/end")
    assert end_res.status_code == 200
    assert end_res.json()["status"] == "ENDED"

    # Cannot start an ended meeting -> 400
    bad_start = client.post(f"/api/v1/meetings/{meeting_id}/start")
    assert bad_start.status_code == 400


def test_livekit_token_generation():
    # 1. Create a meeting
    m_res = client.post("/api/v1/meetings/instant", json={"title": "LiveKit Token Test"})
    assert m_res.status_code == 201
    meeting_id = m_res.json()["id"]

    # 2. Request LiveKit token for guest
    token_payload = {
        "display_name": "Test Guest User",
        "user_id": None,
        "passcode": None
    }
    t_res = client.post(f"/api/v1/meetings/{meeting_id}/token", json=token_payload)
    assert t_res.status_code == 200
    data = t_res.json()
    assert "token" in data
    assert len(data["token"]) > 30
    assert data["room_name"] == meeting_id
    assert data["participant_name"] == "Test Guest User"
    assert data["is_host"] is False
    assert "url" in data

