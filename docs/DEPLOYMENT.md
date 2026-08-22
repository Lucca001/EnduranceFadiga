# Deployment

The stack splits cleanly in two: a stateless Next.js frontend and a stateless FastAPI
service plus a background worker. Any host that runs Node and Docker will do; the
paths below are the ones the repository is pre-configured for.

## 1. Database and cache

Provision managed Postgres 16 and Redis 7 (Neon, Supabase, Railway or Render all work).
Note the connection strings — you'll need them in both services.

Apply the schema once:

```bash
cd apps/web
DATABASE_URL=postgresql://... npx prisma db push --schema ../../prisma/schema.prisma
```

## 2. API + worker (Railway or Render)

`render.yaml` describes both services, Redis and the database — on Render, choose
"New → Blueprint" and point it at the repository.

On Railway, create two services from the same repo with root directory `apps/api`:

| Service | Start command |
| --- | --- |
| API | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Worker | `arq app.workers.sync.WorkerSettings` |

Environment variables:

```
DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...
CORS_ORIGINS=https://your-domain.com
API_SECRET_KEY=<random 32+ chars>
LLM_API_KEY=<optional, enables LLM coaching>
LLM_MODEL=claude-sonnet-5
```

> The API expects the `postgresql+asyncpg://` driver prefix; managed providers hand you
> `postgresql://`. Prisma needs the plain form. Keep both if your host allows it.

Health check: `GET /health` returns model registry status.

## 3. Frontend (Vercel)

Import the repository; `vercel.json` already sets the monorepo build commands.

```
NEXT_PUBLIC_API_URL=https://your-api-host
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

Without `NEXT_PUBLIC_API_URL` the frontend renders demo data — useful for a portfolio
deployment with no backend costs.

## 4. Provider OAuth

Register an application with each provider and add the credentials to the API
environment. Redirect URI: `https://your-api-host/api/v1/integrations/{provider}/callback`.

| Provider | Where to register |
| --- | --- |
| Strava | https://www.strava.com/settings/api |
| Garmin | https://developer.garmin.com |
| TrainingPeaks | https://api.trainingpeaks.com |
| Polar | https://admin.polaraccesslink.com |
| COROS | https://open.coros.com |
| Suunto | https://apizone.suunto.com |

## 5. Post-deploy checklist

- [ ] `GET /health` returns `{"status":"ok"}` with loaded models
- [ ] Frontend reaches the API (no CORS errors in the console)
- [ ] Worker logs show the sync cron ticking every 15 minutes
- [ ] Clerk sign-in redirects correctly on the production domain
- [ ] Database migrations applied
