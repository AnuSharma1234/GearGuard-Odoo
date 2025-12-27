"""
Custom exceptions and error handlers for the GearGuard API.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import ValidationError


class GearGuardException(Exception):
    """Base exception for GearGuard API."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ResourceNotFoundError(GearGuardException):
    """Raised when a requested resource is not found."""
    def __init__(self, resource: str, resource_id: str):
        message = f"{resource} with id '{resource_id}' not found"
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class DuplicateResourceError(GearGuardException):
    """Raised when attempting to create a duplicate resource."""
    def __init__(self, resource: str, field: str, value: str):
        message = f"{resource} with {field} '{value}' already exists"
        super().__init__(message, status.HTTP_409_CONFLICT)


class UnauthorizedError(GearGuardException):
    """Raised when user is not authorized."""
    def __init__(self, message: str = "Not authorized to perform this action"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


async def gearguard_exception_handler(request: Request, exc: GearGuardException):
    """Handler for GearGuard custom exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "type": exc.__class__.__name__
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler for request validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handler for database integrity errors."""
    error_msg = str(exc.orig) if hasattr(exc, 'orig') else str(exc)
    
    # Try to extract meaningful information from the error
    if "unique constraint" in error_msg.lower():
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "detail": "A resource with this value already exists",
                "type": "DuplicateResource"
            }
        )
    elif "foreign key constraint" in error_msg.lower():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": "Referenced resource does not exist",
                "type": "InvalidReference"
            }
        )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Database integrity error",
            "type": "IntegrityError"
        }
    )


async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    """Handler for general SQLAlchemy errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database error occurred",
            "type": "DatabaseError"
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handler for unexpected exceptions."""
    # Log the exception here in production
    print(f"Unexpected error: {type(exc).__name__}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred",
            "type": "InternalServerError"
        }
    )
