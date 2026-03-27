"""
Main FastAPI application entry point.

This module initializes the FastAPI application, configures middleware,
registers routes, and sets up error handlers.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db, close_db
from app.utils.logging_config import setup_logging, get_logger
from app.utils.exceptions import InQuestException
from app.utils.responses import ErrorResponse, HealthCheckResponse, StandardResponse
from app.routes import auth
from config import settings
from datetime import datetime

logger = get_logger(__name__)


# Setup logging on application startup
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    
    Handles startup and shutdown events:
    - Startup: Initialize database, log application start
    - Shutdown: Close database connections
    """
    # Startup event
    logger.info(
        "InQuest application starting",
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
    )

    # Initialize database if not in production
    if settings.ENVIRONMENT != "production":
        logger.info("Initializing database tables...")
        await init_db()

    logger.info("InQuest application started successfully")
    yield

    # Shutdown event
    logger.info("InQuest application shutting down...")
    await close_db()
    logger.info("InQuest application closed")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# Configure CORS middleware
origins = settings.ALLOWED_ORIGINS
if settings.DEBUG:
    # In development, also allow common local ports if not already present
    dev_origins = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        "http://localhost:3002", "http://127.0.0.1:3002",
        "http://localhost:5173", "http://127.0.0.1:5173", 
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://192.168.56.1:5175", "http://192.168.54.69:5175",
        "http://192.168.56.1:3002", "http://192.168.54.69:3002"
    ]
    for origin in dev_origins:
        if origin not in origins:
            origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(InQuestException)
async def inquest_exception_handler(request: Request, exc: InQuestException) -> JSONResponse:
    """
    Handle custom InQuest exceptions.
    
    Args:
        request: FastAPI request object.
        exc: The InQuestException that was raised.
        
    Returns:
        JSON response with error details and appropriate HTTP status code.
    """
    logger.warning(
        "InQuestException caught",
        code=exc.code,
        message=exc.message,
        status_code=exc.status_code,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            status="error",
            code=exc.code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.
    
    Args:
        request: FastAPI request object.
        exc: Any unhandled exception.
        
    Returns:
        JSON response with generic error message.
    """
    import traceback
    logger.error(
        "Unhandled exception",
        error=str(exc),
        error_type=type(exc).__name__,
        traceback=traceback.format_exc(),
    )
    print(traceback.format_exc())

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            status="error",
            code="INTERNAL_ERROR",
            message="An unexpected error occurred. Please try again.",
        ).model_dump(),
    )


# Include route modules
app.include_router(auth.router)

# Import and include rides router
from app.routes import rides, ws, wallet, profile, features, subscriptions
app.include_router(rides.router)
app.include_router(ws.router)
app.include_router(wallet.router)
app.include_router(profile.router)
app.include_router(features.router)
app.include_router(subscriptions.router)


# Health check endpoints
@app.get(
    "/health",
    response_model=StandardResponse,
    tags=["Health"],
    summary="Basic health check",
    description="Returns OK if service is running.",
)
async def health_check() -> StandardResponse:
    """
    Basic health check endpoint.
    
    Should return quickly and indicate if the service is responsive.
    Used by load balancers and orchestration systems.
    
    Returns:
        Success response.
    """
    return StandardResponse(
        status="success",
        message="Service is healthy",
        data={"status": "healthy", "timestamp": datetime.utcnow()},
    )


@app.get(
    "/ready",
    response_model=StandardResponse,
    tags=["Health"],
    summary="Readiness check",
    description="Returns OK if service is ready to handle requests.",
)
async def readiness_check() -> StandardResponse:
    """
    Readiness check endpoint.
    
    More comprehensive than /health - checks if dependencies are ready.
    Used by Kubernetes and other orchestration systems.
    
    Returns:
        Success response if ready.
    """
    # In a real application, you would check database connectivity here
    return StandardResponse(
        status="success",
        message="Service is ready",
        data={"status": "ready", "timestamp": datetime.utcnow()},
    )


@app.get("/", response_model=StandardResponse, tags=["Root"])
async def root() -> StandardResponse:
    """
    Root endpoint providing API information.
    
    Returns:
        API metadata.
    """
    return StandardResponse(
        message=f"{settings.APP_NAME} API",
        data={
            "name": settings.APP_NAME,
            "description": settings.APP_DESCRIPTION,
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
            "docs": "/docs",
            "redoc": "/redoc",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
