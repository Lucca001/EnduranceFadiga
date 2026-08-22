from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ml.registry import model_registry
from app.services.snapshot import build_snapshot

router = APIRouter()


@router.get("/{athlete_id}/summary")
async def summary(athlete_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    snap = await build_snapshot(db, athlete_id)
    return {
        "performance_score": model_registry.performance_score.predict(snap),
        "readiness": {
            "acwr": round(snap.acwr, 2),
            "tsb": round(snap.tsb, 1),
            "hrv_delta_pct": round(snap.hrv_delta_pct, 1),
        },
        "metrics": {
            "vo2max": snap.vo2max,
            "ftp_watts": snap.ftp_watts,
            "threshold_pace_sec_km": snap.threshold_pace_sec_km,
            "ctl": snap.ctl,
            "atl": snap.atl,
            "hrv_rmssd": snap.hrv_rmssd,
            "resting_hr": snap.resting_hr,
            "sleep_hours_7d": snap.sleep_hours_7d,
            "weekly_hours": snap.weekly_hours,
        },
    }
