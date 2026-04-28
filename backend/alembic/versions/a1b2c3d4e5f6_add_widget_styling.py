"""add widget_styling column

Revision ID: a1b2c3d4e5f6
Revises: 46648dc5469b
Create Date: 2026-04-27 00:00:00.000000

"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "46648dc5469b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _default_styling(theme_color: str) -> str:
    """Build a default widget_styling JSON with the client's existing theme_color."""
    return json.dumps({
        "brand": {
            "primary_color": theme_color,
            "primary_text_color": "#ffffff",
            "background_color": "#ffffff",
            "surface_color": "#f3f4f6",
            "text_color": "#1f2937",
            "text_muted_color": "#6b7280",
        },
        "typography": {
            "font_family": "Inter, system-ui, sans-serif",
            "font_url": None,
            "font_size_base": 14,
            "font_weight_body": 400,
            "font_weight_heading": 600,
        },
        "shape": {
            "border_radius_panel": 12,
            "border_radius_bubble": 28,
            "border_radius_message": 12,
            "border_width": 1,
        },
        "layout": {
            "position": "bottom-right",
            "offset_x": 20,
            "offset_y": 20,
            "bubble_size": 56,
            "panel_width": 380,
            "panel_height": 520,
        },
        "motion": {
            "animation_style": "slide",
            "animation_speed": "normal",
            "respect_reduced_motion": True,
        },
        "template_id": "default",
        "template_modified": theme_color != "#4F46E5",
    })


def upgrade() -> None:
    # Add column with empty default
    op.add_column("clients", sa.Column("widget_styling", sa.Text(), nullable=False, server_default="{}"))

    # Data migration: populate widget_styling from existing theme_color
    conn = op.get_bind()
    clients = conn.execute(sa.text("SELECT id, theme_color FROM clients")).fetchall()
    for client_id, theme_color in clients:
        styling_json = _default_styling(theme_color or "#4F46E5")
        conn.execute(
            sa.text("UPDATE clients SET widget_styling = :styling WHERE id = :id"),
            {"styling": styling_json, "id": client_id},
        )


def downgrade() -> None:
    op.drop_column("clients", "widget_styling")
