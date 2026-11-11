"""LinkedIn publishing tables.

Revision ID: 0002_linkedin
Revises: 0001_initial
Create Date: 2026-11-11
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_linkedin"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "linkedin_accounts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("member_sub", sa.String(length=200), nullable=False),
        sa.Column("member_name", sa.String(length=300), nullable=False),
        sa.Column("member_picture", sa.Text(), nullable=True),
        sa.Column("access_token_encrypted", sa.Text(), nullable=False),
        sa.Column("refresh_token_encrypted", sa.Text(), nullable=True),
        sa.Column("scopes", sa.String(length=300), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_linkedin_accounts_member_sub", "linkedin_accounts", ["member_sub"], unique=True
    )

    op.create_table(
        "linkedin_oauth_states",
        sa.Column("state", sa.String(length=200), nullable=False),
        sa.Column("code_verifier_encrypted", sa.Text(), nullable=False),
        sa.Column("redirect_uri", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("state"),
    )

    op.create_table(
        "linkedin_publish_attempts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("draft_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("commentary", sa.Text(), nullable=False),
        sa.Column("has_image", sa.Boolean(), nullable=False),
        sa.Column("image_urn", sa.String(length=300), nullable=True),
        sa.Column("post_urn", sa.String(length=300), nullable=True),
        sa.Column("error_code", sa.String(length=80), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["draft_id"], ["content_drafts.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_linkedin_publish_attempts_draft_id",
        "linkedin_publish_attempts",
        ["draft_id"],
        unique=False,
    )
    op.create_index(
        "ix_linkedin_publish_attempts_status",
        "linkedin_publish_attempts",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_linkedin_publish_attempts_status", table_name="linkedin_publish_attempts")
    op.drop_index("ix_linkedin_publish_attempts_draft_id", table_name="linkedin_publish_attempts")
    op.drop_table("linkedin_publish_attempts")
    op.drop_table("linkedin_oauth_states")
    op.drop_index("ix_linkedin_accounts_member_sub", table_name="linkedin_accounts")
    op.drop_table("linkedin_accounts")
