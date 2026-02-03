-- ONE-CLICK SETUP (FREE MODE) - no auth, no RLS
-- WARNING: This makes your DB + Storage writable/readable by anyone.
-- Use only for local testing / demo.

-- Ensure UUID generation exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Create core tables if missing (matches app expectations)

CREATE TABLE IF NOT EXISTS public.plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  size_sqm NUMERIC NOT NULL DEFAULT 0,
  price_zmw NUMERIC NOT NULL DEFAULT 0,
  price_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold','reserved')),
  is_titled BOOLEAN NOT NULL DEFAULT false,
  has_road_access BOOLEAN DEFAULT false,
  has_water BOOLEAN DEFAULT false,
  has_electricity BOOLEAN DEFAULT false,
  soil_type TEXT,
  distance_from_road TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  audio_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tour_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  message TEXT,
  plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','scheduled','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Ensure columns exist (if you created tables manually earlier)
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

ALTER TABLE public.feeds ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.feeds ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.feeds ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 3) Disable RLS everywhere (FREE MODE)
ALTER TABLE public.plots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_requests DISABLE ROW LEVEL SECURITY;

-- 4) Grant anon/auth full access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

-- 5) Storage: create buckets if missing and make them public
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('property-images', 'property-images', true),
  ('property-media', 'property-media', true),
  ('shamah-media', 'shamah-media', true)
ON CONFLICT (id)
DO UPDATE SET public = EXCLUDED.public, name = EXCLUDED.name;

-- Open storage tables (FREE MODE)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;
