# Contributing

Thanks for taking the time to contribute.

## Getting set up

```bash
cp .env.example .env
docker compose up --build      # or: make db-up && make api && make web
```

The project runs without any credentials — mock data and a deterministic coach engine
keep every screen functional.

## Workflow

1. Fork and branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Keep pull requests focused; one concern per PR.
3. Run `make lint` and `make test` before pushing.
4. Write a clear description of what changed and why.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat(coach): stream responses token by token
fix(sync): handle Strava 429 with retry-after
docs(readme): clarify local setup
```

## Code style

- **Python** — ruff (line length 100), type hints on public functions, docstrings that
  explain *why* rather than *what*.
- **TypeScript** — strict mode, no `any`, components small and reusable.
- Comments only where the reasoning isn't obvious from the code.

## Adding a provider integration

Implement `ProviderAdapter` in `apps/api/app/workers/providers/` and register it in
`ADAPTERS`. Normalize into `NormalizedActivity` / `NormalizedWellness`; the sync engine
handles retries, rate limits and re-auth for you. `strava.py` is the reference implementation.

## Reporting bugs

Open an issue using the bug report template. Include steps to reproduce, expected
versus actual behavior, and your environment.
