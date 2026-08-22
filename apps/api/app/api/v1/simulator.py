from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.requests import ScenarioRequest
from app.services.simulator import simulate
from app.services.snapshot import build_snapshot

router = APIRouter()


@router.post("/{athlete_id}/run")
async def run_scenario(athlete_id: str, body: ScenarioRequest, db: AsyncSession = Depends(get_db)) -> dict:
    snap = await build_snapshot(db, athlete_id)
    return simulate(snap, body.as_changes())
