from typing import Any, Optional
from fastapi import HTTPException, status


class DomainException(Exception):
    """Base exception for domain logic errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Invalid request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ConflictException(HTTPException):
    def __init__(self, detail: str = "Resource already exists or conflict occurred"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden operation"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
