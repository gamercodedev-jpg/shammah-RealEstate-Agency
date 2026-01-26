-- Development-only: allow anon/authenticated clients to insert/update/delete
-- WARNING: These policies are permissive. Use only for local development.

ALTER TABLE IF EXISTS public.plots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news DISABLE ROW LEVEL SECURITY;

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

SELECT schemaname, tablename, policyname, permissive
FROM pg_policies
WHERE tablename IN ('plots','feeds','news','inquiries');

-- Or check enabled state:
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('plots','feeds','news','inquiries');

