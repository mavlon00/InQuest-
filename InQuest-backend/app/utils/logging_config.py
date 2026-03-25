"""
Logging configuration module.

This module sets up structured logging using structlog and loguru for observability.
All log entries are formatted consistently and classified appropriately for monitoring.
"""

import logging
import sys
from typing import Any, Dict
from config import settings
import structlog
from loguru import logger as loguru_logger


def setup_logging() -> None:
    """
    Configure structured logging for the application.
    
    This sets up both structlog for structured logging and loguru for additional
    functionality. All logs are emitted to stderr with appropriate formatting.
    
    Log levels are configured based on the ENVIRONMENT setting:
    - Development: DEBUG
    - Staging: INFO
    - Production: WARNING
    """
    # Determine log level based on environment
    if settings.ENVIRONMENT == "production":
        log_level = settings.LOG_LEVEL or "WARNING"
    elif settings.ENVIRONMENT == "staging":
        log_level = settings.LOG_LEVEL or "INFO"
    else:
        log_level = settings.LOG_LEVEL or "DEBUG"

    # Remove default handler
    loguru_logger.remove()

    # Add structured logging handler
    loguru_logger.add(
        sys.stderr,
        level=log_level,
        format="<level>{time:YYYY-MM-DD HH:mm:ss}</level> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    )

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Set up standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stderr,
        level=getattr(logging, log_level),
    )


def get_logger(name: str) -> Any:
    """
    Get a configured logger instance.
    
    Args:
        name: The name of the logger (typically __name__).
        
    Returns:
        A structured logger instance.
    """
    return structlog.get_logger(name)


class LogContext:
    """
    Context manager for adding structured logging context.
    
    Example:
        with LogContext(user_id="123", action="login"):
            logger.info("User action", details={"ip": "192.168.1.1"})
    """

    def __init__(self, **context: Any) -> None:
        """
        Initialize logging context.
        
        Args:
            **context: Key-value pairs to add to all logs within this context.
        """
        self.context = context
        self._context_token = None

    def __enter__(self) -> "LogContext":
        """Enter context manager."""
        structlog.contextvars.clear_contextvars()
        for key, value in self.context.items():
            structlog.contextvars.bind_contextvars(**{key: value})
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Exit context manager."""
        structlog.contextvars.clear_contextvars()
