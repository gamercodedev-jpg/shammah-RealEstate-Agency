-- Production-safe: allow the public (anon) to read ONLY published feeds
-- Run this in Supabase SQL editor if your website shows blank news due to RLS.

ALTER TABLE IF EXISTS public.feeds ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if re-running
DROP POLICY IF EXISTS "Public read published feeds" ON public.feeds;

CREATE POLICY "Public read published feeds"
ON public.feeds
FOR SELECT
TO anon
USING (is_published IS TRUE);
