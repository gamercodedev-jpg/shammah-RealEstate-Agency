-- DEV / "FREE MODE" ONLY: remove RLS + open everything for anon
-- WARNING: This makes your database + storage writable by anyone on the internet.
-- Do NOT use in production.

-- 1) Disable RLS on app tables
ALTER TABLE IF EXISTS public.plots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news DISABLE ROW LEVEL SECURITY;

-- Ensure anon/authenticated roles have table privileges (RLS is what usually blocks them)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

-- 2) Disable RLS on Supabase Storage tables (opens ALL buckets)
ALTER TABLE IF EXISTS storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS storage.buckets DISABLE ROW LEVEL SECURITY;

-- Make your buckets public (optional but recommended for public URL access)
UPDATE storage.buckets
SET public = true
WHERE id IN (
  'property-images',
  'property-media',
  'shamah-media'
);

-- Grant basic privileges on storage schema tables
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Notes:
-- - If you changed bucket names, add them to the UPDATE list.
-- - If you want to open only specific buckets (safer), don't disable RLS on storage.*;
--   instead create bucket-scoped policies.
