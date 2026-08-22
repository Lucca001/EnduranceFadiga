"""Provider adapter contract.

Every integration (Strava, Garmin, TrainingPeaks, Zwift, Apple Health,
COROS, Polar, Suunto) implements this interface. The sync engine only
talks to the interface — adding a provider never touches core code.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime


@dataclass
class NormalizedActivity:
    external_id: str
    sport: str
    name: str
    started_at: datetime
    duration_sec: int
    distance_m: float | None = None
    elevation_gain_m: float | None = None
    avg_hr: int | None = None
    max_hr: int | None = None
    avg_power_w: int | None = None
    avg_cadence: float | None = None
    avg_pace_sec_per_km: int | None = None
    calories: int | None = None
    training_load: float | None = None
    streams: dict | None = None


@dataclass
class NormalizedWellness:
    date: datetime
    hrv_rmssd: float | None = None
    resting_hr: int | None = None
    sleep_hours: float | None = None
    sleep_score: int | None = None
    vo2max: float | None = None
    weight_kg: float | None = None


class ProviderAdapter(ABC):
    name: str

    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> dict:
        """Exchange a refresh token. Raise ReauthRequired if revoked."""

    @abstractmethod
    async def fetch_activities(self, access_token: str, since: datetime) -> list[NormalizedActivity]:
        ...

    @abstractmethod
    async def fetch_wellness(self, access_token: str, since: datetime) -> list[NormalizedWellness]:
        ...


class ReauthRequired(Exception):
    """User must reconnect the provider (token revoked/expired)."""


class RateLimited(Exception):
    def __init__(self, retry_after_sec: int) -> None:
        self.retry_after_sec = retry_after_sec
