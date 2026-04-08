from __future__ import annotations

"""Alembic environment configuration.

Alembic uses this file to learn:
- how to connect to the database
- which SQLAlchemy metadata describes the application's tables
- how to run migrations in offline and online modes

Most application code never imports this file directly. Alembic calls it when
you run commands such as `alembic upgrade head`.
"""

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from enviro_monitor.config import get_settings
from enviro_monitor.db.base import Base
from enviro_monitor.models.weather import WeatherObservation

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    """Read the database URL from the application's settings."""

    return get_settings().database_url


def run_migrations_offline() -> None:
    """Run migrations without opening a live DB connection.

    Offline mode is mostly used when Alembic needs to generate SQL text instead
    of directly applying changes to a database.
    """

    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a real database connection."""

    section = config.get_section(config.config_ini_section) or {}
    section["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # `target_metadata` lets Alembic compare ORM models and migrations.
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
