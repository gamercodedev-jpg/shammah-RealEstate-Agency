-- Create news table matching requested schema
CREATE TABLE IF NOT EXISTS public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NULL,
  image_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  video_url text NULL,
  audio_url text NULL,
  CONSTRAINT news_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
