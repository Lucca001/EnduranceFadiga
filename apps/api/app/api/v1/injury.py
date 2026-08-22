from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ml.registry import model_registry
from app.services.snapshot import build_snapshot

router = APIRouter()


@router.get("/{athlete_id}")
async def injury_risk(athlete_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    snap = await build_snapshot(db, athlete_id)
    return model_registry.injury_risk.predict(snap)
