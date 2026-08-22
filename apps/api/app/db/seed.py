"""Seed a demo athlete with 90 days of realistic training data.

Run: python -m app.db.seed
"""

import asyncio
import math
import random
import uuid
from datetime import date, datetime, timedelta, timezone

from app.db.models import Activity, Athlete, DailyMetric
from app.db.session import SessionLocal
from app.ml.features import compute_training_loads

import numpy as np


async def seed() -> None:
    rng = random.Random(42)
    async with SessionLocal() as db:
        athlete = Athlete(
            id="demo-athlete",
            clerkId="user_demo",
            email="demo@enduranceai.app",
            name="Alex Rivera",
            weightKg=72.0,
            ftpWatts=268,
            maxHr=188,
            restingHr=46,
            thresholdPaceSecPerKm=255,
        )
        db.add(athlete)

        daily_tss: list[float] = []
        today = date.today()
        for i in range(90, 0, -1):
            d = today - timedelta(days=i)
            # 3-week build / 1-week recover periodization + rest days.
            week_phase = (i // 7) % 4
            base = 55 if week_phase == 3 else 75 + (3 - week_phase) * 8
            is_rest = d.weekday() == 0 and rng.random() < 0.8
            tss = 0.0 if is_rest else max(20, rng.gauss(base, 22))
            daily_tss.append(tss)

            if tss > 0:
                sport = rng.choices(["RUN", "RIDE", "SWIM"], weights=[5, 3, 2])[0]
                duration = int(tss / 70 * 3600)
                distance = duration / 255 * 1000 if sport == "RUN" else duration / 110 * 1000
                db.add(Activity(
                    id=str(uuid.uuid4()),
                    athleteId=athlete.id,
                    provider="STRAVA",
                    externalId=f"seed-{i}",
                    sport=sport,
                    name=f"{'Morning' if rng.random() < 0.6 else 'Evening'} {sport.title()}",
                    startedAt=datetime(d.year, d.month, d.day, 6, 30, tzinfo=timezone.utc),
                    durationSec=duration,
                    distanceM=round(distance),
                    avgHr=int(rng.gauss(148, 10)),
                    avgPaceSecPerKm=int(rng.gauss(280, 20)) if sport == "RUN" else None,
                    avgPowerW=int(rng.gauss(210, 25)) if sport == "RIDE" else None,
                    trainingLoad=round(tss, 1),
                ))

            ctl, atl, tsb = compute_training_loads(np.array(daily_tss))
            hrv = 66 + 6 * math.sin(i / 9) - max(0, atl - ctl) * 0.15 + rng.gauss(0, 3)
            db.add(DailyMetric(
                id=str(uuid.uuid4()),
                athleteId=athlete.id,
                date=d,
                hrvRmssd=round(hrv, 1),
                restingHr=int(46 + max(0, atl - ctl) * 0.08 + rng.gauss(0, 1.5)),
                sleepHours=round(min(9.5, max(5, rng.gauss(7.1, 0.8))), 1),
                vo2max=round(52 + (90 - i) * 0.025, 1),
                ctl=ctl, atl=atl, tsb=tsb,
            ))

        await db.commit()
        print("Seeded demo athlete with 90 days of data.")


if __name__ == "__main__":
    asyncio.run(seed())
