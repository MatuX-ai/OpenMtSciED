.PHONY: dev test docker-up docker-down lint format

dev:
	cd frontend && npm run dev & uvicorn backend.openmtscied.main:app --reload

test:
	pytest tests/
	cd frontend && npm test

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

lint:
	flake8 backend/
	cd frontend && npm run lint

format:
	black backend/
	cd frontend && npx prettier --write .

seed:
	python scripts/graph_db/seed_data.py
