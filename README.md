<div align="center">

<h1>EnduranceAI</h1>

**AI-powered performance intelligence for endurance athletes.**

Connect Strava, Garmin and TrainingPeaks. EnduranceAI analyzes every heartbeat, watt
and night of sleep to predict race times, flag injury risk before it happens, and
coach you in plain language — in English or Portuguese.

[![CI](https://github.com/Lucca001/todos/actions/workflows/ci.yml/badge.svg)](https://github.com/Lucca001/todos/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-13c187.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org)

[Quick start](#quick-start) · [Features](#features) · [Architecture](#architecture) · [The models](#the-models) · [Deployment](#deployment)

</div>

---

## Why

Endurance athletes drown in data and starve for answers. Watches report HRV, training
load and VO₂ Max; none of them answer the only questions that matter: *Can I go hard
tomorrow? Am I about to get injured? What will I run at my next race?*

EnduranceAI turns raw training data into decisions — and explains every one of them
in plain language, never as a bare number.

## Features

| Feature | What it does |
| --- | --- |
| **Dashboard** | Performance Score (0–100), CTL/ATL/TSB training load, HRV & resting-HR trends, VO₂ Max, FTP, sleep — interactive dark-mode charts |
| **AI Coach** | Chat grounded in *your* data. "Can I go hard tomorrow?" returns an answer citing your actual ACWR and HRV trend |
| **Race Predictions** | Finish times with confidence intervals for 5k → Ironman, from a physiological baseline corrected by current form |
| **Race Planner** | Pacing splits, target power, carbs/h, fluids/h and sodium for race day |
| **Injury Risk** | Interpretable risk model over ACWR, ramp rate, HRV suppression, sleep debt and monotony — always shows *why* |
| **Scenario Simulator** | "What if I lose 4 kg / sleep 8h / add 10% volume?" — every model re-runs instantly |
| **Weekly Report** | Auto-generated: volume, load, recovery, strengths, weaknesses, recommendations |
| **AI Insights** | Natural-language analysis, e.g. *"Load rose 18% while HRV dropped 12% — reduce intensity for two days"* |
| **Integrations** | Provider-adapter architecture for Strava, Garmin, TrainingPeaks, Zwift, Apple Health, COROS, Polar and Suunto with auto-sync, retry/backoff and re-auth handling |

Fully bilingual (EN/PT) via `next-intl`, dark theme throughout, responsive from
mobile to ultrawide, and a WebGL landing page with a custom fluid-noise shader.

## Tech stack

**Frontend** — Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Recharts · Clerk · next-intl
**Backend** — Python 3.12 · FastAPI · async SQLAlchemy · arq workers · Pydantic v2
**ML** — Pandas · NumPy · scikit-learn · XGBoost · LightGBM · Prophet
**Data** — PostgreSQL (Prisma schema) · Redis
**Infra** — Docker Compose · GitHub Actions · Vercel (web) · Railway/Render (api)

## Quick start

```bash
git clone https://github.com/Lucca001/todos.git
cd enduranceai
cp .env.example .env
```

**Frontend only** (no database, no API keys — renders realistic demo data):

```bash
cd apps/web && npm install && npm run dev   # http://localhost:3000
```

**Full stack** (Postgres, Redis, API, worker, web):

```bash
docker compose up --build                   # web :3000 · api :8000/docs
```

**Local, without Docker:**

```bash
make db-up          # Postgres + Redis
make api            # FastAPI on :8000
make web            # Next.js on :3000
make db-push seed   # schema + 90 days of demo data
```

> The app is designed to run with zero configuration. Without API keys the frontend
> uses typed mock data, the AI Coach falls back to a deterministic grounded engine,
> and Clerk auth is bypassed. Add `LLM_API_KEY` for LLM coaching and Clerk `pk_`/`sk_`
> keys to enable real authentication.

macOS users can also double-click `INICIAR.command`, which installs dependencies on
first run and opens the app in the browser.

## Architecture

```
enduranceai/
├── apps/
│   ├── web/                      Next.js 14 · App Router · i18n (EN/PT) · Clerk
│   │   └── src/
│   │       ├── app/[locale]/     landing + (app) dashboard · coach · predictions
│   │       │                     injury-risk · simulator · reports · integrations
│   │       ├── components/       ui primitives · charts · layout · WebGL shader
│   │       ├── i18n/             routing + EN/PT message catalogs
│   │       └── lib/              typed API client with mock fallback
│   └── api/                      FastAPI · async SQLAlchemy · arq workers
│       └── app/
│           ├── api/v1/           REST routers
│           ├── ml/               feature engineering · model registry · artifacts
│           │   └── models/       race_predictor · injury_risk · performance_score
│           ├── services/         snapshot · insights · coach · simulator · race planner
│           ├── workers/          sync engine + provider adapters
│           └── db/               SQLAlchemy models · seed
├── prisma/schema.prisma          source of truth for the relational schema
├── docs/                         architecture & deployment guides
└── docker-compose.yml            postgres · redis · api · worker · web
```

Design principles and data flow: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## The models

- **Race predictor** — physiological baseline (threshold pace → Riegel scaling with
  event-specific factors) corrected by a `GradientBoostingRegressor` over 11 features
  (TSB, ACWR, HRV delta, consistency…). Bootstraps itself on first run; retrains
  nightly from real results in production.
- **Injury risk** — calibrated logistic model over established risk factors, returning
  per-factor contributions so the interface can explain itself.
- **Performance Score** — weighted composite of sleep, HRV, load balance, recovery,
  consistency, volume, intensity and fitness trend (nutrition slot scaffolded).
- **Training load** — Banister-style CTL/ATL/TSB via exponentially weighted moving averages.

The model registry loads artifacts at startup and is ready for TensorFlow/PyTorch models.

## Testing

```bash
make test   # model behavior: monotonicity, plausibility, explainability
make lint   # ruff + eslint
```

CI runs both on every push and pull request.

## Publishing & deployment

Publishing this repository to GitHub: [`docs/PUBLICAR-NO-GITHUB.md`](docs/PUBLICAR-NO-GITHUB.md)
(includes authentication troubleshooting — GitHub no longer accepts account passwords over Git).

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for Vercel (frontend), Railway/Render
(API + worker), managed Postgres and Redis, and environment variables.

## Roadmap

- [ ] Garmin, TrainingPeaks and COROS adapters (contract and sync engine already in place)
- [ ] Nightly model retraining from real race results
- [ ] Stream-level analytics (interval detection, decoupling, power curve)
- [ ] Coach seats: share athlete dashboards with a trainer
- [ ] Native mobile app

## License

[MIT](LICENSE) © Lucca

## Author

Built by **Lucca** — [lucca.14@hotmail.com](mailto:lucca.14@hotmail.com)
