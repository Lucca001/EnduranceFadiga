from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ml.models.race_predictor import DISTANCES_KM
from app.ml.registry import model_registry
from app.services.race_planner import build_plan
from app.services.snapshot import build_snapshot

router = APIRouter()


@router.get("/{athlete_id}/races")
async def all_races(athlete_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    snap = await build_snapshot(db, athlete_id)
    return {d: model_registry.race_predictor.predict(snap, d) for d in DISTANCES_KM}


@router.get("/{athlete_id}/race-plan/{distance}")
async def race_plan(athlete_id: str, distance: str, db: AsyncSession = Depends(get_db)) -> dict:
    if distance not in DISTANCES_KM:
        raise HTTPException(404, f"Unknown distance '{distance}'")
    snap = await build_snapshot(db, athlete_id)
    return build_plan(snap, distance)
