# Enterprise Inventory & Order Management API

[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)](https://docker.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions)](https://github.com/features/actions)
[![Coverage](https://img.shields.io/badge/Coverage-90%25+-success)](https://coverage.readthedocs.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Enterprise-grade inventory and order management system with real-time stock tracking across multiple warehouses. Built with FastAPI async backend, PostgreSQL, Redis, and a React admin dashboard with shadcn/ui.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  React   │  │ Swagger  │  │  ReDoc   │  │ Postman  │   │
│  │ Dashboard│  │   UI     │  │          │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │             │             │          │
├───────┴──────────────┴─────────────┴─────────────┴─────────┤
│                       Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Nginx Reverse Proxy                        │  │
│  │  Rate Limiting · Security Headers · WebSocket Proxy  │  │
│  └─────────────────────┬────────────────────────────────┘  │
├────────────────────────┴───────────────────────────────────┤
│                     Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     FastAPI Async · Uvicorn · Gunicorn               │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │  │
│  │  │Auth  │ │Products││Orders │ │Invty │ │Analytics │  │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘  │  │
│  └─────────────────────┬────────────────────────────────┘  │
├────────────────────────┴───────────────────────────────────┤
│                      Data Layer                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   PostgreSQL 16   │  │   Redis 7        │               │
│  │   (Primary Store) │  │  (Cache + Queue)  │              │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.12 + FastAPI 0.110 | Async REST API framework |
| Database | PostgreSQL 16 (psycopg2 + asyncpg) | Primary data store with `SELECT ... FOR UPDATE` |
| Cache | Redis 7 | Session cache, rate limiter, Celery broker |
| Queue | Celery 5.4 | Async task processing (email, exports) |
| Auth | JWT (python-jose) + bcrypt (passlib) | Access/refresh token pair |
| Frontend | React 19 + TanStack Router + shadcn/ui | Admin dashboard |
| Proxy | Nginx | Reverse proxy, rate limiting, WebSocket |
| Metrics | Prometheus | `/metrics` endpoint |
| Logging | structlog | Structured JSON logging with rotation |
| Monitoring | Sentry | Error tracking (optional) |
| CI/CD | GitHub Actions | Lint → Test → Build → Deploy |
| Infra | Docker Compose + AWS ECS | Container orchestration |

## Features

### Real-Time Inventory Management
- Track stock across 5 warehouses with per-location quantities
- Concurrency-safe stock reservation using `SELECT ... FOR UPDATE`
- Low-stock alerts via WebSocket push to dashboard
- Inventory transaction history with full audit trail

### Order Processing
- Create orders with automatic stock reservation
- Multi-item order support with line-level pricing
- Order status lifecycle: `pending → confirmed → processing → shipped → delivered`
- Automatic stock release on cancellation
- Concurrent ordering safety (no overselling)

### Enterprise Security
- JWT access + refresh token authentication
- Role-based access control (admin, manager, viewer)
- Rate limiting per endpoint (slowapi)
- Security headers (HSTS, CSP, X-Frame-Options)
- Input sanitization middleware
- Request ID tracing on every response

### Observability
- Structured JSON logging with structlog
- Daily log rotation with 30-day retention
- Prometheus metrics at `/metrics`
- Sentry error tracking (optional)
- Health check endpoint (`/health`)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.12+ (for local development)

### Installation

```bash
git clone https://github.com/tedsimwa/enterprise-api-gateway.git
cd enterprise-api-gateway
cp .env.example .env
docker compose up --build
```

This starts all 6 services:
| Service | Port | Description |
|---------|------|-------------|
| Frontend | `:80` (via nginx) | React admin dashboard |
| API | `:8000` | FastAPI REST API |
| Celery Worker | — | Async task processor |
| PostgreSQL | `:5432` | Primary database |
| Redis | `:6379` | Cache & message broker |
| Nginx | `:80` | Reverse proxy + rate limiting |

### Access Points
- **Admin Dashboard**: http://localhost
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **Metrics**: http://localhost:8000/metrics (internal only)

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `Admin123!` |
| Manager | `manager@example.com` | `Manager123!` |

## Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows
# source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
# From project root, start only DB + Redis:
docker compose up -d db redis
# Start backend from backend/ directory:
cd backend && uvicorn src.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev  # Vite dev server with proxy → localhost:8000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/inventory_db` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `SECRET_KEY` | `change-me` | JWT signing secret (change in production!) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | JWT refresh token TTL |
| `CORS_ORIGINS` | `["http://localhost:5173","http://localhost:3000"]` | Allowed CORS origins |
| `ENVIRONMENT` | `development` | Runtime environment |
| `LOG_LEVEL` | `INFO` | Logging level |
| `SENTRY_DSN` | _(empty)_ | Sentry DSN for error tracking |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |

## API Documentation

Interactive API documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when the server is running.

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/refresh` | Refresh access token | Refresh token |
| GET | `/auth/me` | Get current user profile | Yes |
| GET | `/api/products` | List products (paginated) | Yes |
| POST | `/api/products` | Create product | Admin |
| GET | `/api/products/{id}` | Get product details | Yes |
| GET | `/api/inventory` | List all inventory | Yes |
| GET | `/api/inventory/low-stock` | Low stock report | Yes |
| GET | `/api/orders` | List orders (paginated) | Yes |
| POST | `/api/orders` | Create order | Yes |
| GET | `/api/orders/{id}` | Get order details | Yes |
| GET | `/api/warehouses` | List warehouses | Yes |
| GET | `/api/analytics/revenue` | Revenue analytics | Yes |
| GET | `/health` | Health check | No |
| WS | `/ws` | WebSocket (alerts) | Token param |

## Testing

```bash
# Backend tests (84 tests)
cd backend && pytest --cov=src --cov-report=term-missing --cov-report=html

# Frontend tests (47 tests)
cd frontend && npm test

# Frontend E2E tests (Playwright)
cd frontend && npm run e2e

# Backend lint
cd backend && ruff check src/

# Backend type check
cd backend && mypy src/
```

## Engineering Challenges Overcome

### 1. Concurrent Inventory Reservation
PostgreSQL `SELECT ... FOR UPDATE` prevents overselling when 10+ orders hit the same product simultaneously. Each order creation locks the affected inventory rows, checks available stock, reserves quantities, and releases the lock — all within a single database transaction.

### 2. Standardized Error Format
Every API error returns a consistent JSON payload with `status`, `code`, `message`, `details`, `timestamp`, and `request_id` fields. This is enforced through a global exception handler that catches custom `AppException` subclasses (8 types covering 404, 401, 403, 409, 422, 429 scenarios).

### 3. Seed Data Parity
Backend seed data matches frontend mock data exactly — same 12 products, 4 warehouses, 60 orders, and per-warehouse inventory quantities. This ensures the dashboard works identically whether running against the real API or demo mode.

## Deployment

### Docker Compose (Development/Staging)
```bash
docker compose up --build -d
```

### AWS ECS (Production)
The CI/CD pipeline in `.github/workflows/ci.yml` automatically:
1. Runs lint + tests + type checks
2. Builds Docker images
3. Pushes to Amazon ECR
4. Deploys to ECS Fargate

Configuration:
- Task definition with api + celery_worker containers
- Application Load Balancer in front of API
- RDS PostgreSQL for production database
- ElastiCache Redis for caching

## Project Structure

```
enterprise-api-gateway/
├── backend/                # Python backend application
│   ├── src/                # FastAPI source code
│   │   ├── api/            # Route handlers
│   │   ├── middleware/     # Request ID, logging, metrics, sanitization
│   │   ├── models/         # SQLAlchemy ORM models (8 tables)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic layer
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── config.py       # Pydantic Settings
│   │   ├── database.py     # Async SQLAlchemy engine
│   │   ├── exceptions.py   # Custom exceptions
│   │   ├── seed.py         # Database seed script
│   │   └── celery_app.py   # Celery worker config
│   ├── tests/              # 84 backend tests
│   ├── alembic/            # Database migrations
│   ├── scripts/            # Utility scripts
│   ├── Dockerfile          # Backend Docker image
│   └── pyproject.toml      # Python project config
├── frontend/               # React admin dashboard
│   ├── src/routes/         # TanStack Router pages
│   ├── src/components/     # UI components (shadcn/ui)
│   └── src/lib/            # API client, types, auth
├── nginx/                  # Production reverse proxy config
├── postman/                # Postman collection
├── docker-compose.yml      # Multi-service orchestration
└── .github/workflows/      # CI/CD pipeline
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m "feat: add amazing feature"`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

**Author**: Ted Simwa — [GitHub](https://github.com/tedsimwa)
