from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ml.registry import model_registry
from app.services.insight_engine import generate_insights
from app.services.snapshot import build_snapshot

router = APIRouter()


@router.get("/{athlete_id}/weekly")
async def weekly_report(athlete_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    snap = await build_snapshot(db, athlete_id)
    risk = model_registry.injury_risk.predict(snap)
    score = model_registry.performance_score.predict(snap)
    return {
        "volume": {"hours": snap.weekly_hours, "km_run": snap.weekly_km_run},
        "load": {"ctl": snap.ctl, "atl": snap.atl, "tsb": snap.tsb, "ramp_pct": snap.ramp_rate_pct},
        "recovery": {
            "hrv_delta_pct": round(snap.hrv_delta_pct, 1),
            "sleep_avg_h": snap.sleep_hours_7d,
        },
        "performance_score": score,
        "risk": risk,
        "strengths": [i for i in generate_insights(snap, risk) if i["severity"] == "positive"],
        "recommendations": [i for i in generate_insights(snap, risk) if i["severity"] != "positive"],
    }
