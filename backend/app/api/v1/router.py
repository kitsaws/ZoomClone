from fastapi import APIRouter
from app.api.v1.users import router as users_router
from app.api.v1.meetings import router as meetings_router
from app.api.v1.participants import router as participants_router
from app.api.v1.join_requests import router as join_requests_router

api_router = APIRouter()

api_router.include_router(users_router)
api_router.include_router(meetings_router)
api_router.include_router(participants_router)
api_router.include_router(join_requests_router)
