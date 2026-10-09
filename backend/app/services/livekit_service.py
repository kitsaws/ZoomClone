from livekit import api
from app.core.config import settings
from app.models.meeting import Meeting


class LiveKitService:
    @staticmethod
    def generate_meeting_token(
        meeting: Meeting,
        identity: str,
        name: str,
        is_host: bool = False,
    ) -> str:
        """
        Generate a scoped, secure LiveKit JWT AccessToken for a given meeting.
        API secret is kept strictly server-side.
        """
        token = api.AccessToken(
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
        )
        token.with_identity(identity)
        token.with_name(name)

        grants = api.VideoGrants(
            room_join=True,
            room=meeting.id,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
            room_admin=is_host,
            room_record=is_host,
        )
        token.with_grants(grants)
        return token.to_jwt()
