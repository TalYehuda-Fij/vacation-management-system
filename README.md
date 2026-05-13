# Vacation Management System

A full-stack web application for managing employee vacation requests. Employees (requesters) submit vacation requests and track their status; managers (validators) review all requests, filter by status, and approve or reject them — rejections require a comment.

## Stack

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia, Axios
- **Backend:** Node.js + Express + TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL 16
- **Auth:** JWT (HS256) + bcrypt
- **API docs:** Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`)
- **Tests:** Vitest + Supertest (backend), Vitest + Vue Test Utils (frontend)
- **Dev environment:** Docker Compose

## Quick Start

```bash
git clone <repo-url>
cd vacation-management-system
cp .env.example .env
docker compose up --build
```

Open **http://localhost:5173** in your browser.

### Try it — seeded credentials

All passwords are `password123`.

| Role      | Name            | Email               |
|-----------|-----------------|---------------------|
| Validator | Bob Validator   | bob@example.com     |
| Validator | Carol Validator | carol@example.com   |
| Requester | Alice Requester | alice@example.com   |
| Requester | David Requester | david@example.com   |
| Requester | Eve Requester   | eve@example.com     |
| Requester | Frank Requester | frank@example.com   |
| Requester | Grace Requester | grace@example.com   |
| Requester | Henry Requester | henry@example.com   |

## API Docs

Swagger UI is available at **http://localhost:3000/api/docs** once the backend is running.

## Project Structure

```
/
├── docker-compose.yml
├── .env.example
├── backend/
│   └── src/
│       ├── entities/       # TypeORM entities
│       ├── routes/         # Express routers
│       ├── controllers/    # Request handlers
│       ├── services/       # Business logic
│       ├── middleware/     # Auth, error handler
│       ├── dto/            # Zod validation schemas
│       ├── config/         # DataSource, logger
│       ├── migrations/
│       └── seed.ts
└── frontend/
    └── src/
        ├── views/          # LoginView, RequesterView, ValidatorView, MetricsView
        ├── components/     # RequestForm, RequestList, StatusBadge, RejectDialog,
        │                   # AppSidebar, StatCard, ActivityFeed
        ├── stores/         # auth, requests (Pinia)
        ├── api/            # Axios instance + typed endpoints
        └── router/
```

## Technical Decisions

- **JWT over sessions:** stateless auth scales horizontally without shared session storage; the 8-hour expiry fits a working-day use case.
- **TypeORM over Prisma:** matches the assignment's explicit requirement and gives fine-grained migration control via raw SQL in migration files.
- **Schema additions:** beyond the minimal spec, `email` and `password_hash` on `users` are required to support email/password login under JWT; `reviewed_by` and `reviewed_at` on `vacation_requests` are required to display audit info in the validator view and activity feed.
- **Date-overlap returns 409 (Conflict):** a new request conflicts with an existing resource (a pending/approved booking), making 409 more semantically accurate than 422.
- **Plain CSS only:** no UI framework or utility library — scoped `<style>` blocks per component with CSS custom properties for design tokens.

## Known Limitations

- No email notifications on status changes.
- No multi-tenant org support — all users share one instance.
- No full audit log; only `reviewed_by` / `reviewed_at` are tracked.
- Single-region timezone assumption — dates are stored as `date` (no timezone) and displayed as-is.

## Running Tests

**Via Docker (recommended)** — uses the `test` profile which spins up the `vacation_test` database automatically:

```bash
docker compose up db --wait          # ensure db is healthy
docker compose --profile test run --rm backend-test
```

**Backend integration tests (local):**

```bash
cd backend
npm install
NODE_ENV=test npm test
```

> Requires a local PostgreSQL instance with both `vacation` and `vacation_test` databases.  
> The `vacation_test` database is created automatically when the Docker db service first starts.

**Frontend unit tests:**

```bash
cd frontend
npm install
npm test
```

## Bonus Features Implemented

- Date-overlap detection (returns `409 DATE_OVERLAP`)
- Swagger / OpenAPI documentation
- Pagination and sorting on the validator list endpoint
- Responsive UI (collapses to card layout at 375 px)
- Docker Compose (single `docker compose up --build` starts everything) with a separate `test` profile for the isolated `vacation_test` database
- Backend integration tests covering all key routes plus metrics endpoints
- Frontend unit tests for form validation and component behaviour
- **Dashboard widgets:** stat cards (Total / Pending / Approved / Rejected) with progress bars and an Activity Feed on the validator view
- **Sidebar navigation** (collapsible) shared across both roles, replacing the top bar
- **Status tabs** on the requester view to filter own requests
- **Metrics dashboard** (`/metrics`): SVG donut chart for requesters showing personal day usage, horizontal bar chart for validators showing every employee's days taken against a 20-day quota with overdraft tracking
