from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter()


_admin_password_hash: str | None = None


def _get_admin_hash() -> str:
    global _admin_password_hash
    if _admin_password_hash is None:
        _admin_password_hash = hash_password(settings.admin_password)
    return _admin_password_hash


@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Admin login — returns a JWT token for dashboard authentication.
    Currently supports a single admin account defined in environment variables.
    """
    if request.email != settings.admin_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(request.password, _get_admin_hash()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(request.email)
    return LoginResponse(access_token=token)
