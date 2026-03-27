"""
Standard response models for API endpoints.

All API responses follow a consistent structure with status, message, and data fields.
This ensures frontend developers have a predictable interface to work with.
"""

from pydantic import BaseModel, Field
from typing import Any, Optional, Generic, TypeVar, List
from datetime import datetime


T = TypeVar("T")


class StandardResponse(BaseModel):
    """
    Standard success response wrapper.
    
    All successful API responses should follow this structure to provide
    consistency across the API for client developers.
    
    Attributes:
        status: Always "success" for successful responses.
        message: Human-readable success message.
        data: The actual response payload.
        timestamp: When the response was generated.
    """

    status: str = Field(default="success", description="Response status")
    message: str = Field(description="Success message")
    data: Optional[Any] = Field(default=None, description="Response payload")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Response timestamp")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Operation successful",
                "data": {"id": 1, "name": "John Doe"},
                "timestamp": "2024-01-15T10:30:00",
            }
        }


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated response wrapper for list endpoints.
    
    Attributes:
        status: Always "success" for successful responses.
        message: Success message.
        data: List of items in current page.
        pagination: Pagination metadata.
        timestamp: Response timestamp.
    """

    status: str = Field(default="success")
    message: str = Field(description="Success message")
    data: List[T] = Field(description="List of items")
    pagination: dict = Field(description="Pagination metadata")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Items retrieved",
                "data": [{"id": 1}, {"id": 2}],
                "pagination": {
                    "page": 1,
                    "size": 10,
                    "total": 25,
                    "pages": 3,
                },
                "timestamp": "2024-01-15T10:30:00",
            }
        }


class ErrorResponse(BaseModel):
    """
    Standard error response wrapper.
    
    All error responses follow this structure to provide consistent error
    information to frontend developers.
    
    Attributes:
        status: Always "error" for error responses.
        code: Machine-readable error code.
        message: Human-readable error message.
        details: Optional additional error details.
        timestamp: When the error occurred.
    """

    status: str = Field(default="error", description="Response status")
    code: str = Field(description="Error code identifier")
    message: str = Field(description="Error message")
    details: Optional[dict] = Field(default=None, description="Additional error details")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Error timestamp")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "status": "error",
                "code": "AUTH_001",
                "message": "Invalid credentials provided",
                "details": {"field": "phone_number"},
                "timestamp": "2024-01-15T10:30:00",
            }
        }


class HealthCheckResponse(BaseModel):
    """
    Health check response.
    
    Used by monitoring systems to determine application status.
    """

    status: str = Field(description="Service status: healthy, degraded, or unhealthy")
    version: str = Field(description="Application version")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "timestamp": "2024-01-15T10:30:00",
            }
        }
