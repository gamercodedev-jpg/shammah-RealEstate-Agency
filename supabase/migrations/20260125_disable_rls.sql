-- Development-only: disable Row-Level Security and remove policies for ease of local testing
-- WARNING: This makes the listed tables fully writable by any role. Do NOT deploy to production.

ALTER TABLE IF EXISTS public.plots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news DISABLE ROW LEVEL SECURITY;

-- Drop any policies on these tables (if present)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('plots','feeds','news','inquiries')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END$$;
