# Security & Data Protection (SafeReport)

This document outlines recommended security controls for production deployment of SafeReport, focusing on PII protection, encryption at rest, audit trails, and RBAC.

1. Encryption at rest
---------------------
- All PII fields (phone numbers, home addresses, national ID numbers, names when required) MUST be encrypted at rest using AES-256-GCM.
- Use a Key Management Service (KMS) such as AWS KMS, GCP KMS, or Azure Key Vault. Do NOT store encryption keys alongside data.
- Use envelope encryption: generate a unique data encryption key (DEK) per record or per tenant, encrypt data with DEK (AES-256-GCM), then encrypt the DEK with a KMS-managed Key Encryption Key (KEK).
- Store the encrypted DEK and the ciphertext together. Include an encryption metadata object (algorithm, key id, iv, tag) for each encrypted field.

2. Field-level encryption
-------------------------
- Apply field-level encryption for sensitive columns rather than whole-disk encryption alone, so queries that don't need PII can run without key access.
- Example schema:

  Cases table

  - id (uuid)
  - incident_type
  - province
  - district
  - victim_phone_encrypted (ciphertext)
  - victim_address_encrypted (ciphertext)
  - encrypted_DEK_meta (json: { kek_id, iv, tag })
  - assigned_to
  - created_at

3. RBAC (Role-Based Access Control)
----------------------------------
- Define roles: `admin`, `responder`, `activist`, `auditor`, `anonymous`.
- Implement authorization checks at the API layer; never rely solely on UI checks.
- Principle of least privilege: default to redacting PII unless the requesting principal has explicit access.
- Use attribute-based access control (ABAC) rules for granular policies: e.g., allow `responder` to view PII only for cases where `assigned_to === responder.id`.

4. Audit Trails
---------------
- Record an append-only audit log for every access and modification of a case, including: action (view/edit/delete), case id, user id, role, timestamp, client IP, and justification when possible.
- Store audit logs in a tamper-evident system (WORM storage or append-only DB). Consider periodic snapshots hashed and anchored (e.g., store hash in another system or blockchain anchor) for integrity verification.
- Provide an API `GET /cases/:id/history` that returns a chronological, read-only list of audit events. This endpoint should be restricted to `admin` or `auditor` roles.

5. Transport security
---------------------
- Enforce TLS 1.2+ for all client-server and server-server communications.
- Use HSTS and secure cookie flags for web sessions.

6. Authentication
-----------------
- Use centralized authentication (OIDC/JWT) with short-lived tokens and refresh tokens.
- Implement device/session management and allow administrators to revoke tokens.

7. Logging & Monitoring
-----------------------
- Emit structured logs for security events (failed logins, suspicious activity, large exports).
- Integrate with SIEM and set alerts for anomalous behaviors (many case views by one user, off-hours access patterns).

8. Data residency & backups
---------------------------
- Ensure backups are encrypted and stored in the same jurisdiction or per partner requirements. For Zambia, check NGO and government guidelines on data residency.

9. Privacy by Design checklist (quick)
-----------------------------------
- Minimize PII collection by default; collect only what's necessary.
- Provide user controls for anonymous reporting and explicit consent where PII is collected.
- Implement data retention policies and automated deletion/archival.

10. Implementation notes for developers
--------------------------------------
- Use battle-tested libraries for cryptography (e.g., libsodium, WebCrypto, or built-in cloud KMS SDKs). Avoid homegrown crypto.
- Rotate KEKs regularly and design key rotation workflows that re-encrypt DEKs securely.
- Design test suites for auditing: include tests that simulate user role changes and validate that PII is redacted appropriately.

11. Example: Field-level encryption flow (server-side)

1. Server requests a new DEK from a secure random generator.
2. Encrypt the PII field with AES-256-GCM using the DEK, record iv and auth tag.
3. Use KMS to encrypt the DEK, store encrypted DEK metadata with the row.
4. To decrypt, request KMS to unwrap the DEK (requires appropriate IAM permissions), then decrypt the field.

Contact / Handover
------------------
I can expand this into an operational runbook (key rotation steps, owner roles, and checklist) and produce sample code for field encryption/decryption in Node/Express or in your backend stack. Tell me which stack you prefer.
