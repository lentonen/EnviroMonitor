from __future__ import annotations

"""Database engine and session helpers.

This module is responsible for creating SQLAlchemy's connection objects.

Important concepts:
- Engine: manages database connections
- Session: unit of work used for queries/inserts/updates
- sessionmaker: factory that creates Session objects

The rest of the app should not build engines manually. It should call the
helpers in this file so database access is configured consistently.
"""

from collections.abc import Iterator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from enviro_monitor.config import get_settings

# Lazily created singletons. They start as `None` and are created only when
# the app first needs to talk to the database.
_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


def get_engine() -> Engine:
    """Return the shared SQLAlchemy engine for the application.

    The engine is created only once and then reused. This avoids creating
    a new connection manager every time some code needs database access.
    """

    global _engine
    if _engine is None:
        settings = get_settings()
        # `pool_pre_ping=True` helps detect dead/stale DB connections before use.
        _engine = create_engine(settings.database_url, pool_pre_ping=True)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    """Return the shared session factory.

    A session factory is a callable that creates Session objects with the same
    configuration each time.
    """

    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(
            bind=get_engine(),
            # `autoflush=False` means SQLAlchemy will not automatically push
            # pending changes before every query unless explicitly needed.
            autoflush=False,
            # Modern SQLAlchemy keeps transaction control explicit, so automatic
            # commit behavior is disabled.
            autocommit=False,
            # Keep objects usable after commit without reloading them immediately.
            expire_on_commit=False,
        )
    return _session_factory


def get_session() -> Iterator[Session]:
    """Yield one database session and close it afterwards.

    This pattern is useful when you want a short-lived session for one unit of
    work. The `finally` block guarantees cleanup even if an error happens.

    FastAPI usage:
    - Declare one session per request via dependency injection:

      from fastapi import Depends
      from sqlalchemy.orm import Session
      from enviro_monitor.db.session import get_session

      def handler(session: Session = Depends(get_session)) -> ...:
          ...
    """

    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()
