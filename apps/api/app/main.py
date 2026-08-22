from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.ml.registry import model_registry


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm the ML model registry before serving traffic."""
    model_registry.load_all()
    yield


app = FastAPI(
    title="EnduranceAI API",
    version="1.0.0",
    description="AI-powered analytics for endurance athletes.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["ops"])
async def health() -> dict:
    return {"status": "ok", "models": model_registry.status()}
