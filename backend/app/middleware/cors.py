from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import settings


class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")

        # Determine if this origin is allowed
        allowed = False
        if origin == settings.dashboard_origin:
            allowed = True
        elif settings.environment == "development" and (
            "localhost" in origin or "127.0.0.1" in origin
        ):
            allowed = True

        # Handle preflight (OPTIONS) requests
        if request.method == "OPTIONS" and allowed:
            return Response(
                status_code=204,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
                    "Access-Control-Max-Age": "3600",
                },
            )

        # Process the actual request
        response = await call_next(request)

        # Add CORS headers to the response
        if allowed:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, X-API-Key, Authorization"
            )

        return response
