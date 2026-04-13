from __future__ import annotations

import argparse
import logging
import time

from enviro_monitor.clients.open_meteo import OpenMeteoClient
from enviro_monitor.config import get_settings
from enviro_monitor.db.session import get_session_factory
from enviro_monitor.logging_config import configure_logging
from enviro_monitor.repositories.weather_repository import WeatherObservationRepository
from enviro_monitor.services.ingest_weather import WeatherIngestionService

logger = logging.getLogger(__name__)


def run_once() -> int:
    """Run one ingestion cycle and return the number of inserted records.

    Returns:
        int: The number of inserted records.
    """

    settings = get_settings()
    session_factory = get_session_factory()
    with OpenMeteoClient(settings) as client:
        with session_factory() as session:
            repository = WeatherObservationRepository(session)
            service = WeatherIngestionService(client=client, repository=repository)
            return service.ingest()


def run_loop() -> None:
    """Run the ingestion loop in a loop until the process is terminated. Poll interval is defined in the settings."""
    settings = get_settings()
    while True:
        try:
            run_once()
        except Exception:
            logger.exception("weather_ingestion_failed")
        time.sleep(settings.poll_interval_seconds)


def build_parser() -> argparse.ArgumentParser:
    """
    Build the command-line interface (CLI) argument parser.

    The CLI expects a single positional argument called `command`:
    - `once`: Run a single ingestion cycle and then exit.
    - `loop`: Run ingestion forever, sleeping `POLL_INTERVAL_SECONDS` between cycles.

    Examples:
        python -m enviro_monitor.main once
        python -m enviro_monitor.main loop
    """
    parser = argparse.ArgumentParser(description="EnviroMonitor backend")
    parser.add_argument(
        "command",
        choices=["once", "loop"],
        help="Execution mode: run a single cycle (`once`) or continuously (`loop`).",
    )
    return parser


def main() -> None:
    """Main function to run the application."""
    configure_logging()
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "once":
        run_once()
        return

    run_loop()

# When this module is executed directly, run the CLI entrypoint.
# When imported (e.g., by tests or other modules), this guard prevents ingestion from
# starting as a side effect of the import.
if __name__ == "__main__":
    main()
