Demo RBAC + Audit Server
========================

This is a minimal Express-based demo server intended to illustrate:

- Role-Based Access Control (RBAC) middleware (`/server/middleware/rbac.js`)
- Audit logging middleware which records API calls (`/server/middleware/audit.js`)
- Example endpoints which redact PII unless a user is assigned to a case.

NOT FOR PRODUCTION: the server uses an in-memory store and a very simple mock auth header for demonstration only.

Quick start
-----------

1. From the project root, create a node project in `/server` and install deps:

```bash
cd server
npm init -y
npm install express body-parser helmet cors ws pg jsonwebtoken dotenv
```

2. Run the server:

```bash
node index.js
```

3. Example requests:

List cases (PII redacted unless assigned):

```bash
curl -H "x-mock-user: {\"id\":\"user1\",\"role\":\"activist\",\"assignedCases\":[]}" http://localhost:4000/api/cases
```

View case with mock assigned user (see PII):

```bash
curl -H "x-mock-user: {\"id\":\"responder-1\",\"role\":\"responder\",\"assignedCases\":[\"case-123\"]}" http://localhost:4000/api/cases/case-123
```

Fetch audit history (admin only):

```bash
curl -H "x-mock-user: {\"id\":\"admin\",\"role\":\"admin\"}" http://localhost:4000/api/cases/case-123/history
```

Environment variables (demo):

- `DATABASE_URL` — Postgres connection string (optional for demo; if provided, server will attempt to use DB)
- `JWT_SECRET` — secret for signing JWTs (demo)
- `SERVER_KEK` — base64 32-byte key used to wrap DEKs for field-level encryption (demo only)

Run with env:

```bash
DATABASE_URL=postgres://user:pass@localhost:5432/safereport JWT_SECRET=secret SERVER_KEK=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))") node index.js
```

Security notes
--------------
This server is intentionally minimal. For production, use real authentication (JWT/OAuth), HTTPS, persistent audit store, and field-level encryption.
