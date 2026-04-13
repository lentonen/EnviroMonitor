"""create weather observations table

Revision ID: 20260408_0001
Revises:
Create Date: 2026-04-08 08:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Alembic uses the metadata below to build a dependency graph of migrations and decide
# the correct order to apply them.
#
# - revision: Unique identifier for THIS migration. Other migrations will reference this
#   value in their `down_revision`.
# - down_revision: The immediate parent migration that must run before this one.
#   `None` means this is the first (base) migration in the project.
# - branch_labels: Optional labels used when maintaining multiple migration branches.
#   Typically `None` unless you intentionally branch your migration history.
# - depends_on: Optional extra revision(s) that this migration depends on in addition to
#   `down_revision` (commonly used for cross-branch dependencies). Usually `None`.
revision = "20260408_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply this migration.

    In Alembic, `upgrade()` describes the schema changes to move the database
    forward to this revision.
    """

    op.create_table(
        "weather_observations",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("record_type", sa.String(length=20), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("timezone", sa.String(length=100), nullable=False),
        sa.Column("observation_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("temperature_c", sa.Float(), nullable=True),
        sa.Column("wind_speed_kmh", sa.Float(), nullable=True),
        sa.Column("precipitation_mm", sa.Float(), nullable=True),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint(
            "source",
            "latitude",
            "longitude",
            "observation_time",
            "record_type",
            name="uq_weather_observations_source_location_time_type",
        ),
    )
    op.create_index(
        "ix_weather_observations_observation_time",
        "weather_observations",
        ["observation_time"],
    )


def downgrade() -> None:
    """Undo this migration.

    `downgrade()` should reverse what `upgrade()` created so the schema can be
    rolled back if needed.
    """

    op.drop_index("ix_weather_observations_observation_time", table_name="weather_observations")
    op.drop_table("weather_observations")
