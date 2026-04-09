from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import auth, chat, clients, health
from app.config import settings
from app.middleware.cors import DynamicCORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    print(f"Starting Chat Widget API ({settings.environment})")
    yield
    # --- Shutdown ---
    print("Shutting down Chat Widget API")


app = FastAPI(
    title="Chat Widget API",
    description="Embeddable chat widget backend powered by Gemini",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware — must be added before routes
app.add_middleware(DynamicCORSMiddleware)

# Register route groups under /api/v1
# The prefix means all routes in chat.router start with /api/v1
# So @router.post("/chat") becomes POST /api/v1/chat
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(chat.router, prefix="/api/v1", tags=["widget"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(clients.router, prefix="/api/v1", tags=["dashboard"])
