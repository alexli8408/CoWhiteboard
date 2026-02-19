import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import rooms, ws

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("🚀 Starting Collaborative Whiteboard API")
    # Supabase client is lazily initialized on first use
    yield
    logger.info("👋 Shutting down Collaborative Whiteboard API")


app = FastAPI(
    title="Collaborative Whiteboard API",
    description="Real-time collaborative whiteboard backend with FastAPI + Supabase",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(rooms.router)
app.include_router(ws.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
