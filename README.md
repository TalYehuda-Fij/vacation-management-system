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

## Quick Start

```bash
git clone <repo-url>
cd vacation-management-system
cp .env.example .env
docker compose up --build
```

Open `http://localhost:5173`.

### Seeded credentials

All passwords are `password123`.

| Role      | Email               |
|-----------|---------------------|
| Validator | bob@example.com     |
| Requester | alice@example.com   |

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
- **TypeORM over Prisma:** matches the assignment requirement; explicit migrations.
- **Schema additions:** `email` and `password_hash` on `users` support login under JWT; `reviewed_by` and `reviewed_at` on `vacation_requests` track approval audit info.
- **Date-overlap returns 409:** a new request conflicts with an existing pending/approved booking, making Conflict more accurate than Unprocessable Entity.
- **Plain CSS:** scoped `<style>` blocks per component with CSS custom properties for design tokens.

## Known Limitations

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
- Pagination and sorting on the validator list endpoint
- Responsive UI (mobile breakpoint at 640px)
- Single-command Docker Compose setup with a dedicated test profile
- Backend integration tests and frontend unit tests
