from pydantic import BaseModel, Field


class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255, pattern=r"^[a-z0-9-]+$")
    system_prompt: str = "You are a helpful assistant."
    welcome_message: str = "Hi! How can I help you today?"
    theme_color: str = Field(default="#4F46E5", pattern=r"^#[0-9A-Fa-f]{6}$")
    allowed_origins: str = ""
    max_tokens: int = Field(default=1024, ge=1, le=8192)
    model_name: str = "gemini-2.0-flash"


class ClientUpdate(BaseModel):
    name: str | None = None
    system_prompt: str | None = None
    welcome_message: str | None = None
    theme_color: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    allowed_origins: str | None = None
    max_tokens: int | None = Field(default=None, ge=1, le=8192)
    model_name: str | None = None
    is_active: bool | None = None


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

    model_config = {"from_attributes": True}


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
