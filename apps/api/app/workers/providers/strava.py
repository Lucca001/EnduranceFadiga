"""Strava adapter — reference implementation of the provider contract."""

from datetime import datetime

import httpx

from app.core.config import settings
from app.workers.providers.base import (
    NormalizedActivity,
    NormalizedWellness,
    ProviderAdapter,
    RateLimited,
    ReauthRequired,
)

BASE = "https://www.strava.com/api/v3"

SPORT_MAP = {"Run": "RUN", "Ride": "RIDE", "VirtualRide": "RIDE", "Swim": "SWIM"}


class StravaAdapter(ProviderAdapter):
    name = "STRAVA"

    async def refresh_token(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://www.strava.com/oauth/token",
                data={
                    "client_id": settings.strava_client_id,
                    "client_secret": settings.strava_client_secret,
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                },
            )
        if r.status_code in (400, 401):
            raise ReauthRequired
        r.raise_for_status()
        return r.json()

    async def fetch_activities(self, access_token: str, since: datetime) -> list[NormalizedActivity]:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{BASE}/athlete/activities",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"after": int(since.timestamp()), "per_page": 100},
            )
        if r.status_code == 429:
            raise RateLimited(retry_after_sec=900)
        if r.status_code == 401:
            raise ReauthRequired
        r.raise_for_status()
        return [self._normalize(a) for a in r.json()]

    async def fetch_wellness(self, access_token: str, since: datetime) -> list[NormalizedWellness]:
        return []  # Strava does not expose HRV/sleep; other providers do.

    def _normalize(self, a: dict) -> NormalizedActivity:
        distance_m = a.get("distance") or 0
        moving = a.get("moving_time") or 0
        pace = round(moving / (distance_m / 1000)) if distance_m else None
        return NormalizedActivity(
            external_id=str(a["id"]),
            sport=SPORT_MAP.get(a.get("sport_type", ""), "OTHER"),
            name=a.get("name", "Workout"),
            started_at=datetime.fromisoformat(a["start_date"].replace("Z", "+00:00")),
            duration_sec=moving,
            distance_m=distance_m,
            elevation_gain_m=a.get("total_elevation_gain"),
            avg_hr=a.get("average_heartrate"),
            max_hr=a.get("max_heartrate"),
            avg_power_w=a.get("average_watts"),
            avg_cadence=a.get("average_cadence"),
            avg_pace_sec_per_km=pace,
            calories=a.get("calories"),
        )
