.PHONY: dev api web db-up db-push seed test lint

dev:            ## Start full stack
	docker compose up --build

db-up:          ## Start only Postgres + Redis
	docker compose up -d postgres redis

api:            ## Run API locally (needs db-up)
	cd apps/api && uvicorn app.main:app --reload

web:            ## Run frontend locally
	cd apps/web && npm run dev

db-push:        ## Apply Prisma schema
	cd apps/web && npx prisma db push --schema ../../prisma/schema.prisma

seed:           ## Seed demo data
	cd apps/api && python -m app.db.seed

test:           ## Run backend tests
	cd apps/api && pytest -q

lint:
	cd apps/api && ruff check app
	cd apps/web && npm run lint
