from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.requests import CoachQuestion
from app.services import coach_service
from app.services.snapshot import build_snapshot

router = APIRouter()


@router.post("/{athlete_id}/ask")
async def ask(athlete_id: str, body: CoachQuestion, db: AsyncSession = Depends(get_db)) -> dict:
    snap = await build_snapshot(db, athlete_id)
    return await coach_service.answer(body.question, snap, body.locale)
