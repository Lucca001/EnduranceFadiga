# Architecture

## Principles

1. **One snapshot, many models.** Every model (race, injury, score, simulator)
   consumes the same `AthleteSnapshot`, so predictions never contradict each other.
2. **Explainability is a feature.** Models return factors and natural language,
   not bare numbers. The insight engine is deterministic and auditable; the LLM
   handles only open-ended conversation, always grounded in the snapshot.
3. **Degrade gracefully.** No DB → demo snapshot. No LLM key → rules engine.
   No backend → typed mock data in the web client. The product is always demoable.
4. **Providers are plugins.** `ProviderAdapter` is the only contract the sync
   engine knows. Adding COROS or Suunto never touches core code.

## Data flow

```
Strava / Garmin / ...          (OAuth, webhooks + 15-min polling)
        │
        ▼
  arq sync workers ──► normalize ──► upsert (provider, external_id)
        │                                  │
        │                                  ▼
        │                    recompute CTL / ATL / TSB, daily metrics
        │                                  │
        ▼                                  ▼
  error handling                  AthleteSnapshot (features.py)
  · RateLimited → deferred retry           │
  · ReauthRequired → flag + UI prompt      ├──► RacePredictor
  · transient → arq backoff (5 tries)      ├──► InjuryRiskModel
                                           ├──► PerformanceScoreModel
                                           ├──► InsightEngine (NL rules)
                                           ├──► Simulator (dataclass replace + re-run)
                                           └──► AI Coach (LLM, grounded context)
```

## Auth

Clerk on the frontend; the API trusts Clerk-issued JWTs (JWKS verification —
`python-jose` is already wired in requirements). In demo mode both layers no-op.

## Database

Prisma schema is the source of truth and owns migrations. The Python service
mirrors tables with async SQLAlchemy (`app/db/models.py`) — same table/column
names, camelCase, so both sides read one schema.

## Scaling path

- API is stateless → horizontal scale behind a load balancer.
- Redis backs both the sync queue (arq) and hot-metric caching.
- Model registry loads artifacts from disk today; swap to S3/MLflow by changing
  one loader. Nightly retraining is a scheduled arq job.
- Activity streams stored as downsampled JSON now; move to TimescaleDB or
  Parquet + object storage when stream analytics land.
