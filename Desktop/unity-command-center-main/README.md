# SafeReport (Mthunzi-Tech-Labs)

This repository is a demonstration GBV management system for Zambia used by Mthunzi-Tech-Labs. It includes a Vite/React dashboard, a demo Node backend, Supabase integration, and example security controls for handling sensitive survivor data.

## Security Architecture

- AES-256 Envelope Encryption: Field-level PII (names, phone numbers) should be encrypted using per-field Data Encryption Keys (DEKs). DEKs are wrapped with a Key Encryption Key (KEK) managed by KMS (AWS KMS, Azure Key Vault, or GCP KMS). The repository includes a sample `server/crypto.js` demonstrating AES-GCM usage for the demo.
- Row-Level Security (RLS): Use Postgres RLS policies to ensure survivors can insert but not select; responders only see reports for their province. See `server/supabase_rls_and_policies.sql` for example policies and a `reports_redacted` view which excludes sensitive PII.
- Audit Logs: Any access to raw PII must be recorded in `audit_logs`. A controlled accessor function (`request_report_pii`) inserts an audit entry and returns PII. In production, build a server-side mediator (Edge Function) to create the audit entry then stream results to the auditor without granting long-lived PII claims.
- Transport & Keys: Always use TLS for API and Supabase connections. Never place KEKs or long-lived service keys in client code. Use environment variables for runtime secrets and rotate keys regularly.

## System Architecture

- Frontend: Vite + React application (src/) provides the admin dashboard and USSD simulator. It uses Supabase for persistence and an optional demo backend for geofencing and notifications.
- Backend: Demo Node server in `server/` handles responder assignment, broadcast, and SMS stubs. For production, replace SMS stubs with a provider (Twilio/Africa's Talking) and run a hardened API server.
- Edge Functions: Supabase Edge Functions (Deno/TypeScript) are used for sensitive server-side tasks like AI triage and audit-aware PII access.
- Datastore: PostgreSQL (Supabase) with RLS and triggers. Field-level encryption applied to sensitive columns.

## Installation Guide (developer)

1. Copy `.env.example` to `.env.local` and fill values for Supabase and API base.

2. Frontend

```bash
cd ./
npm install
npm run dev
```

3. Demo backend (optional)

```bash
cd server
npm install
JWT_SECRET=dev SECRET=dev node index.js
```

4. Postgres migrations (example)

Run the SQL files in `server/migrations` and `server/supabase_rls_and_policies.sql` against your Supabase Postgres instance.

5. Edge Functions (AI Triage)

Deploy the function in `functions/triage-edge-function.ts` to Supabase Edge Functions and set `OPENAI_API_KEY`.

## Operational Notes

- Monitor `audit_logs` closely and send alerts on unusual PII access patterns.
- Integrate a KMS for KEK management; never store unwrapped DEKs in the DB.
- Provide training and clear SOPs for responders regarding data handling and quick exit procedures.

## Self-Healing & Scalability

- React Query (stale-while-revalidate + retry): The app uses `@tanstack/react-query` to provide cached data immediately and retry failed network requests with exponential backoff. This ensures a better UX in low-bandwidth areas.
- Edge Functions for scale: Use Supabase Edge Functions for server-side tasks (AI triage, data healing). They autoscale during traffic spikes and avoid overloading a single server.
- Connection Pooling: For production Postgres, use the Supabase connection pooler to avoid `too many connections` errors under traffic spikes.
- Data Healer: A webhook + Edge Function pattern validates and corrects common data entry mistakes (province typos, malformed phone numbers) using lightweight heuristics and optional AI verification. See `functions/healer-edge-function.ts`.
- Local autosave: The UI includes a hook `useAutoSaveReport` that persists in-progress reports to localStorage every 5s and offers restore on reload/crash.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
