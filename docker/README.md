# Docker

`docker-compose.yml` at the repository root brings up the full stack:

| Service | Port | Purpose |
| --- | --- | --- |
| `postgres` | 5432 | Primary database |
| `redis` | 6379 | Sync queue (arq) and metric cache |
| `api` | 8000 | FastAPI, hot reload in development |
| `worker` | — | Background sync jobs |
| `web` | 3000 | Next.js frontend |

```bash
docker compose up --build         # everything
docker compose up -d postgres redis   # just the data layer
docker compose logs -f worker     # follow sync jobs
docker compose down -v            # stop and wipe volumes
```
