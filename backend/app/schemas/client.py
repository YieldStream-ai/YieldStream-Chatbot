import json

from pydantic import BaseModel, Field, model_validator

from app.schemas.widget_styling import WidgetStyling


class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255, pattern=r"^[a-z0-9-]+$")
    system_prompt: str = "You are a helpful assistant."
    welcome_message: str = "Hi! How can I help you today?"
    theme_color: str = Field(default="#4F46E5", pattern=r"^#[0-9A-Fa-f]{6}$")
    allowed_origins: str = ""
    max_tokens: int = Field(default=1024, ge=1, le=8192)
    model_name: str = "gemini-2.0-flash"
    widget_styling: WidgetStyling | None = None


class ClientUpdate(BaseModel):
    name: str | None = None
    system_prompt: str | None = None
    welcome_message: str | None = None
    theme_color: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    allowed_origins: str | None = None
    max_tokens: int | None = Field(default=None, ge=1, le=8192)
    model_name: str | None = None
    is_active: bool | None = None
    widget_styling: WidgetStyling | None = None


class ClientResponse(BaseModel):
    id: str
    name: str
    slug: str
    allowed_origins: str
    system_prompt: str
    welcome_message: str
    theme_color: str
    max_tokens: int
    model_name: str
    is_active: bool
    widget_styling: dict = Field(default_factory=dict)

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_widget_styling(cls, data):
        """Parse widget_styling from JSON string (DB) into dict for API response."""
        if hasattr(data, "widget_styling"):
            raw = data.widget_styling
        elif isinstance(data, dict):
            raw = data.get("widget_styling", "{}")
        else:
            return data

        if isinstance(raw, str):
            try:
                styling = WidgetStyling.from_json(raw)
            except Exception:
                styling = WidgetStyling()
            if isinstance(data, dict):
                data["widget_styling"] = styling.model_dump()
            else:
                # For ORM models, we need to handle via __dict__ copy
                data_dict = {}
                for field_name in cls.model_fields:
                    data_dict[field_name] = getattr(data, field_name, None)
                data_dict["widget_styling"] = styling.model_dump()
                return data_dict
        return data


class APIKeyResponse(BaseModel):
    id: str
    key_prefix: str
    rate_limit_rpm: int
    rate_limit_rpd: int
    is_active: bool

    model_config = {"from_attributes": True}


class APIKeyCreateResponse(BaseModel):
    id: str
    raw_key: str
    key_prefix: str
    rate_limit_rpm: int
    rate_limit_rpd: int
