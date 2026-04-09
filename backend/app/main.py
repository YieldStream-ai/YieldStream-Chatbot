import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import auth, chat, clients, health
from app.config import settings
from app.middleware.cors import DynamicCORSMiddleware


def setup_logging():
    """Configure structured logging. JSON in production, readable in dev."""
    level = logging.DEBUG if settings.environment == "development" else logging.INFO
    handler = logging.StreamHandler(sys.stdout)

    if settings.environment == "production":
        # JSON format for production — parseable by CloudWatch, Datadog, etc.
        formatter = logging.Formatter(
            '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s %(levelname)-8s %(name)s — %(message)s",
            datefmt="%H:%M:%S",
        )

    handler.setFormatter(formatter)
    logging.basicConfig(level=level, handlers=[handler], force=True)

    # Quiet down noisy libraries
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info(f"Starting Chat Widget API ({settings.environment})")
    yield
    logger.info("Shutting down Chat Widget API")


app = FastAPI(
    title="Chat Widget API",
    description="Embeddable chat widget backend powered by Gemini",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(DynamicCORSMiddleware)


# Global exception handler — catches unhandled errors so they return
# a clean JSON response instead of a 500 HTML page.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled error: {type(exc).__name__}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(chat.router, prefix="/api/v1", tags=["widget"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(clients.router, prefix="/api/v1", tags=["dashboard"])
