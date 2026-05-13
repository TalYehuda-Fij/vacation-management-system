# Vacation Management System

A full-stack web application for managing employee vacation requests. Employees submit requests and track their status; managers review all requests, filter by status, and approve or reject them — rejections require a comment.

## Stack

- **Frontend:** Vue 3 (Composition API), Vue Router, Pinia, Axios
- **Backend:** Node.js, Express, TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL 16
- **Auth:** JWT (HS256), bcrypt
- **API docs:** Swagger / OpenAPI
- **Tests:** Vitest, Supertest, Vue Test Utils
- **Dev environment:** Docker Compose

## Prerequisites

- **Docker Desktop** 4.0+ (or Docker Engine 20.10+ with Docker Compose v2)
- **Git**
- Free local ports: **5173** (frontend), **3000** (backend), **5432** (PostgreSQL)

Verify your setup:

```bash
docker --version          # Docker version 20.10 or newer
docker compose version    # Docker Compose version v2.x
```

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd vacation-management-system

# 2. Copy the environment template (defaults work out of the box)
cp .env.example .env

# 3. Build and start everything (db, backend, frontend)
docker compose up --build
```

Wait until you see logs from all three containers:

```
db-1       | database system is ready to accept connections
backend-1  | Backend listening on :3000
frontend-1 |   ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser and sign in with the seeded credentials below.

### Stopping the app

```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers and wipe the database volume
```

### Seeded credentials

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

Swagger UI: `http://localhost:3000/api/docs`

## Project Structure

```
/
├── docker-compose.yml
├── .env.example
├── backend/
│   └── src/
│       ├── entities/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── dto/
│       ├── config/
│       ├── migrations/
│       └── seed.ts
└── frontend/
    └── src/
        ├── views/
        ├── components/
        ├── stores/
        ├── api/
        └── router/
```

## Technical Decisions

- **JWT over sessions:** stateless auth, no shared session storage.
- **TypeORM:** matches the assignment requirement; explicit migrations.
- **Schema additions:** `email` and `password_hash` on `users` support login under JWT; `reviewed_by` and `reviewed_at` on `vacation_requests` track approval audit info.
- **Date-overlap returns 409:** a new request conflicts with an existing pending/approved booking, making Conflict more accurate than Unprocessable Entity.
- **Plain CSS:** scoped `<style>` blocks per component with CSS custom properties for design tokens.

## Known Limitations

- No sign-up flow — users must be added via the seed or directly in the database.
- No email notifications on status changes.
- No multi-tenant org support.
- No audit log beyond `reviewed_by` and `reviewed_at`.
- Single-region timezone assumption.

## Running Tests

Backend integration tests (via Docker, with isolated `vacation_test` database):

```bash
docker compose --profile test run --rm --build backend-test
```

Frontend unit tests:

```bash
cd frontend
npm install
npm test
```

## Bonus Features

- Date-overlap detection
- Swagger / OpenAPI documentation
- Responsive UI (mobile breakpoint at 640px)
- Single-command Docker Compose setup with a dedicated test profile
- Backend integration tests and frontend unit tests
