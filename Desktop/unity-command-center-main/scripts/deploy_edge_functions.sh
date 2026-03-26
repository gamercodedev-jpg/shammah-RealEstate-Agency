#!/usr/bin/env bash
# Deploy Supabase Edge Functions in this repo. Requires supabase CLI and logged-in user.
# Set SUPABASE_PROJECT_REF (or edit the deploy commands) and ensure env vars are set in Supabase.

set -e
PROJECT_REF=${SUPABASE_PROJECT_REF:-"<your-project-ref>"}

echo "Deploying Edge Functions to project: $PROJECT_REF"

# Deploy files in functions/ directory. Name the deployed function after the filename (without extension).
for f in functions/*.ts; do
  name=$(basename "$f" .ts)
  echo "Deploying $name"
  supabase functions deploy "$name" --project-ref "$PROJECT_REF" --no-verify
done

echo "Deployment complete. Remember to set environment variables for each function in the Supabase dashboard:"
echo "  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, MEDIATOR_SECRET, HEALER_SECRET, USSD_TRIAGE_URL"
