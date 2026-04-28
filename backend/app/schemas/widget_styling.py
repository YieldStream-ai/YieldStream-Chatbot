"""
Widget styling schema — design tokens for the embeddable chat widget.

Tokens are grouped into 5 sections (Brand, Typography, Shape, Layout, Motion).
Each field has a type, range/enum constraint, and sensible default.
The full bundle is stored as JSON in the Client model's widget_styling column.
"""
import json
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator


class BrandTokens(BaseModel):
    primary_color: str = Field(default="#4F46E5", pattern=r"^#[0-9A-Fa-f]{6}$")
    primary_text_color: str = Field(default="#ffffff", pattern=r"^#[0-9A-Fa-f]{6}$")
    background_color: str = Field(default="#ffffff", pattern=r"^#[0-9A-Fa-f]{6}$")
    surface_color: str = Field(default="#f3f4f6", pattern=r"^#[0-9A-Fa-f]{6}$")
    text_color: str = Field(default="#1f2937", pattern=r"^#[0-9A-Fa-f]{6}$")
    text_muted_color: str = Field(default="#6b7280", pattern=r"^#[0-9A-Fa-f]{6}$")


class TypographyTokens(BaseModel):
    font_family: str = Field(default="Inter, system-ui, sans-serif", max_length=200)
    font_url: str | None = Field(default=None, max_length=500)
    font_size_base: int = Field(default=14, ge=12, le=18)
    font_weight_body: Literal[400, 500] = 400
    font_weight_heading: Literal[500, 600, 700] = 600

    @field_validator("font_url")
    @classmethod
    def validate_font_url(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        parsed = urlparse(v)
        allowed_hosts = {"fonts.googleapis.com", "fonts.gstatic.com"}
        if parsed.hostname not in allowed_hosts:
            raise ValueError(
                f"Font URL must be from {', '.join(sorted(allowed_hosts))}"
            )
        if parsed.scheme not in ("https", "http"):
            raise ValueError("Font URL must use http or https")
        return v


class ShapeTokens(BaseModel):
    border_radius_panel: int = Field(default=12, ge=0, le=24)
    border_radius_bubble: int = Field(default=28, ge=0, le=28)
    border_radius_message: int = Field(default=12, ge=0, le=20)
    border_width: int = Field(default=1, ge=0, le=2)


class LayoutTokens(BaseModel):
    position: Literal["bottom-right", "bottom-left", "top-right", "top-left"] = "bottom-right"
    offset_x: int = Field(default=20, ge=0, le=80)
    offset_y: int = Field(default=20, ge=0, le=80)
    bubble_size: int = Field(default=56, ge=48, le=72)
    panel_width: int = Field(default=380, ge=320, le=480)
    panel_height: int = Field(default=520, ge=400, le=680)


class MotionTokens(BaseModel):
    animation_style: Literal["slide", "fade", "scale", "none"] = "slide"
    animation_speed: Literal["slow", "normal", "fast", "instant"] = "normal"
    respect_reduced_motion: bool = True


class WidgetStyling(BaseModel):
    brand: BrandTokens = Field(default_factory=BrandTokens)
    typography: TypographyTokens = Field(default_factory=TypographyTokens)
    shape: ShapeTokens = Field(default_factory=ShapeTokens)
    layout: LayoutTokens = Field(default_factory=LayoutTokens)
    motion: MotionTokens = Field(default_factory=MotionTokens)
    template_id: str | None = "default"
    template_modified: bool = False

    def to_json(self) -> str:
        return self.model_dump_json()

    @classmethod
    def from_json(cls, raw: str) -> "WidgetStyling":
        if not raw or raw == "{}":
            return cls()
        return cls.model_validate_json(raw)

    @classmethod
    def from_dict_safe(cls, data: dict | str | None) -> "WidgetStyling":
        """Parse from dict or JSON string, falling back to defaults on error."""
        if data is None:
            return cls()
        if isinstance(data, str):
            return cls.from_json(data)
        return cls.model_validate(data)

    def to_css_variables(self) -> dict[str, str]:
        """Flatten tokens into CSS variable names and values for shadow DOM injection."""
        speed_map = {"slow": "400ms", "normal": "250ms", "fast": "150ms", "instant": "0ms"}
        return {
            "--chat-primary-color": self.brand.primary_color,
            "--chat-primary-text": self.brand.primary_text_color,
            "--chat-bg": self.brand.background_color,
            "--chat-surface": self.brand.surface_color,
            "--chat-text": self.brand.text_color,
            "--chat-text-muted": self.brand.text_muted_color,
            "--chat-font-family": self.typography.font_family,
            "--chat-font-size": f"{self.typography.font_size_base}px",
            "--chat-font-weight-body": str(self.typography.font_weight_body),
            "--chat-font-weight-heading": str(self.typography.font_weight_heading),
            "--chat-radius-panel": f"{self.shape.border_radius_panel}px",
            "--chat-radius-bubble": f"{self.shape.border_radius_bubble}px",
            "--chat-radius-message": f"{self.shape.border_radius_message}px",
            "--chat-border-width": f"{self.shape.border_width}px",
            "--chat-offset-x": f"{self.layout.offset_x}px",
            "--chat-offset-y": f"{self.layout.offset_y}px",
            "--chat-bubble-size": f"{self.layout.bubble_size}px",
            "--chat-panel-width": f"{self.layout.panel_width}px",
            "--chat-panel-height": f"{self.layout.panel_height}px",
            "--chat-animation-duration": speed_map[self.motion.animation_speed],
        }
