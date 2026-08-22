"""Background sync engine (arq).

- `sync_all_athletes` runs every 15 min and fans out per integration.
- Exponential backoff on transient errors; integrations flip to
  REAUTH_REQUIRED when tokens are revoked so the UI can prompt the user.
"""

import logging
from datetime import datetime, timedelta

from arq import cron
from arq.connections import RedisSettings

from app.core.config import settings
from app.workers.providers.base import ProviderAdapter, RateLimited, ReauthRequired
from app.workers.providers.strava import StravaAdapter

logger = logging.getLogger("sync")

ADAPTERS: dict[str, ProviderAdapter] = {
    "STRAVA": StravaAdapter(),
    # "GARMIN": GarminAdapter(), "TRAININGPEAKS": ..., "ZWIFT": ...,
    # "APPLE_HEALTH": ..., "COROS": ..., "POLAR": ..., "SUUNTO": ...
}


async def sync_all_athletes(ctx: dict) -> None:
    """Fan out one job per (athlete, provider) with a fresh token."""
    # TODO(db): iterate integrations WHERE status IN (CONNECTED, ERROR)
    logger.info("sync fan-out tick")


async def sync_integration(ctx: dict, integration_id: str, provider: str) -> None:
    adapter = ADAPTERS.get(provider)
    if adapter is None:
        logger.warning("no adapter for %s", provider)
        return
    try:
        since = datetime.utcnow() - timedelta(days=14)
        activities = await adapter.fetch_activities("token-from-db", since)
        wellness = await adapter.fetch_wellness("token-from-db", since)
        logger.info("synced %d activities, %d wellness rows", len(activities), len(wellness))
        # TODO(db): upsert on (provider, external_id); recompute CTL/ATL/TSB.
    except ReauthRequired:
        logger.warning("integration %s needs re-auth", integration_id)
        # TODO(db): set status=REAUTH_REQUIRED; notify user in-app.
    except RateLimited as e:
        await ctx["redis"].enqueue_job(
            "sync_integration", integration_id, provider, _defer_by=e.retry_after_sec
        )
    except Exception:
        logger.exception("sync failed for %s", integration_id)
        # arq retries with backoff via max_tries below.
        raise


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    functions = [sync_integration]
    cron_jobs = [cron(sync_all_athletes, minute={0, 15, 30, 45})]
    max_tries = 5
    retry_delay = 60
