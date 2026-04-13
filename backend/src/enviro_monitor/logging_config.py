from __future__ import annotations

"""Logging setup for the backend application.

This module keeps logging configuration in one place so the rest of the code
can simply call `logger.info(...)` or `logger.exception(...)`.

Why JSON logs?
- They are easy for humans to read.
- They are also easy for log tools to parse later.
- They keep each log line structured with consistent keys.
"""

import json
import logging
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """Turn Python log records into one JSON string per log line.

    Python's logging module creates a `LogRecord` every time code writes a log.
    This formatter decides how that record should look when printed.

    Example output:
    {
        "timestamp": "...",
        "level": "INFO",
        "logger": "enviro_monitor.services.ingest_weather",
        "message": "weather_ingestion_completed",
        "event_data": {...}
    }
    """

    def format(self, record: logging.LogRecord) -> str:
        """Build a JSON object from a standard logging record.

        `record` contains the message, log level, logger name, and optional
        exception information. We copy the most useful values into a dictionary
        and convert that dictionary into JSON text.

        Returns:
            str: The JSON string representation of the log record.
        """
        payload = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Some log calls pass custom fields through the `extra` argument.
        # Python copies those fields onto the log record, so
        # `extra={"event_data": ...}` becomes `record.event_data` here.
        if hasattr(record, "event_data"):
            payload["event_data"] = record.event_data

        # If the log was written with logger.exception(...) or exc_info=True,
        # add the formatted stack trace so debugging is easier.
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def configure_logging() -> None:
    """Configure the application's root logger once.

    The root logger is the top-level logger in Python's logging system.
    By attaching one handler here, all module loggers in the application
    inherit the same behavior.

    This function is intentionally safe to call multiple times. If logging
    has already been configured, it exits without adding duplicate handlers.
    """
    root_logger = logging.getLogger()
    if root_logger.handlers:
        return

    # StreamHandler writes logs to the console (stdout/stderr depending on the
    # logging setup). This is useful for local development and Docker logs.
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    # INFO means "show normal runtime events and errors, but skip debug noise".
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)
