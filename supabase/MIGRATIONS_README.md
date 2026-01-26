# Applying SQL migrations to Supabase

This project includes a migration file that adds `video_url` and `audio_url` columns to `plots` and `news`.

File:
- `supabase/migrations/20260125_add_media_columns.sql`

Options to apply the SQL:

1) Supabase SQL Editor (quick)
- Open your Supabase project -> Database -> SQL Editor
- Paste the contents of the SQL file and run it.

2) Supabase CLI (recommended for reproducible deployments)
- Install CLI: https://supabase.com/docs/guides/cli
- Authenticate: `supabase login`
- Run migration (from repo root):

```bash
supabase db remote set <PROJECT_REF>
supabase db query < supabase/migrations/20260125_add_media_columns.sql
```

3) Via psql with connection string
- Get your database connection string from Supabase (Settings -> Database -> Connection Pooling -> Connection string)
- Run:

```bash
psql "<CONNECTION_STRING>" -f supabase/migrations/20260125_add_media_columns.sql
```

Notes
- The migration uses `IF NOT EXISTS` to be safe to re-run.
- Make sure your Supabase role has permission to alter tables.
- After migrating, confirm the columns in the table schema and adjust any client code if necessary.
