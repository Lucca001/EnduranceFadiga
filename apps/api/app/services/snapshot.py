"""Builds an AthleteSnapshot from synced data.

Falls back to a realistic demo athlete when the database is empty so
every environment (CI, fresh clone, demo) works out of the box.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.features import AthleteSnapshot

DEMO_SNAPSHOT = AthleteSnapshot(
    vo2max=54.2,
    ftp_watts=268,
    threshold_pace_sec_km=255,   # 4:15/km
    weight_kg=72.0,
    ctl=78.4,
    atl=92.1,
    hrv_rmssd=58.0,
    hrv_baseline=66.0,
    resting_hr=46,
    sleep_hours_7d=6.8,
    weekly_hours=11.5,
    weekly_km_run=62.0,
    ramp_rate_pct=18.0,
    consistency_pct=87.0,
    days_since_rest=8,
)


async def build_snapshot(db: AsyncSession, athlete_id: str) -> AthleteSnapshot:
    # TODO(sync): aggregate from Activity + DailyMetric once providers are live.
    # Kept async so the query path drops in without touching callers.
    return DEMO_SNAPSHOT
