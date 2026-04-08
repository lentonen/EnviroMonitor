from __future__ import annotations

"""SQLAlchemy ORM declarative base for the project.

Why this exists:
- All ORM model classes should inherit from `Base`.
- SQLAlchemy collects table/mapping information into `Base.metadata`.
- Alembic uses that metadata (see `alembic/env.py`) to autogenerate and run
  migrations consistently.

Keeping `Base` in a dedicated module avoids import cycles and provides a single,
stable place to reference the application's metadata.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Root class for all SQLAlchemy ORM models in this repository."""
