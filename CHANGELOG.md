# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-08-22

### Added

- Next.js 14 frontend with App Router, bilingual EN/PT interface and dark premium UI
- Marketing landing page with a custom WebGL fluid-noise shader (zero dependencies)
- Dashboard: Performance Score ring, CTL/ATL/TSB chart, HRV & resting-HR chart,
  recent activities and AI insights
- AI Coach chat grounded in athlete data, with an LLM path and a deterministic fallback
- Race predictions (5k → Ironman) with confidence intervals and race-day plans
- Injury risk model with per-factor explanations
- Scenario simulator and automated weekly report
- FastAPI backend with async SQLAlchemy, arq workers and a model registry
- Provider-adapter sync architecture with a Strava reference implementation
- Prisma schema, seed with 90 days of periodized demo data
- Docker Compose stack, GitHub Actions CI, model behavior tests
