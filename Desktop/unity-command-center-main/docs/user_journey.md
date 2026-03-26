# User Journey Map

## Persona 1 — Survivor (USSD)

- Entry: Survivor dials USSD code and selects "Report".
- Flow: Guided prompts collect incident type, location (district/province), safe contact number, and description. The app saves a minimal report (redacted) to Supabase using an anonymous, write-only role.
- Safety: After submitting, the app provides a one-time confirmation code and instructs the survivor on privacy steps. No readable copy of the report is returned to the survivor's phone.
- Outcome: A redacted report is created in the `reports` table. Only `reports_redacted` view is used for downstream responder assignment.

## Persona 2 — Police Officer / Responder (Web Dashboard)

- Entry: Officer logs in via the dashboard. Their JWT includes role=`responder` and `province` claim.
- Flow: Dashboard lists incidents via `reports_redacted` limited to the officer's province. Officer opens a case, adds a `case_note` to confirm dispatch.
- Trigger: The database trigger (case_notes -> reports) marks the report `In Progress` when the first responder note is added.
- PII: When an officer needs PII, they click "Request PII." The dashboard calls a server-side endpoint which:
  - Inserts an `audit_logs` entry with reason and actor.
  - Returns PII to the officer for that session only.
- Safety: The dashboard features a `Quick Exit` (double-esc/hidden button) that clears local storage and immediately redirects away.

## Security Checklist

- Survivors: write-only access.
- Responders: province-scoped read access, write notes.
- Auditors: PII access via auditable, mediated flows only.
