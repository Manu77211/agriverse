"""
Krishi Sakhi — Structured Logging.

Uses structlog for JSON-formatted, structured logging.
In production: JSON logs (machine-readable, works with Railway logs).
In development: Pretty-printed colored logs (human-readable).
"""

import logging
import sys

import structlog

from app.config import get_settings


def setup_logging() -> None:
    """
    Configure structured logging for the application.
    Call this once at startup in main.py.
    """
    settings = get_settings()

    # Determine log level from config
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # Shared processors for all environments
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.is_production:
        # Production: JSON output for Railway/cloud log aggregation
        shared_processors.append(structlog.processors.format_exc_info)
        renderer = structlog.processors.JSONRenderer()
    else:
        # Development: Pretty colored console output
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging to use structlog
    formatter = structlog.stdlib.ProcessorFormatter(
        processor=renderer,
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(log_level)

    # Silence noisy third-party loggers
    for noisy_logger in ["httpx", "httpcore", "uvicorn.access", "watchfiles"]:
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Get a named logger instance.
    
    Usage:
        from app.middleware.logger import get_logger
        logger = get_logger(__name__)
        logger.info("sensor_data_received", farm_id="abc-123", readings=7)
    """
    return structlog.get_logger(name)
