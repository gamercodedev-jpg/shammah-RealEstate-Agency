create table public.plots (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text null,
  price_zmw numeric null,
  location text null,
  image_url text null,
  status text null default 'Available'::text,
  created_at timestamp with time zone null default now(),
  price_usd numeric null,
  size_sqm numeric null,
  is_titled boolean null default false,
  is_featured boolean null default false,
  images text[] null,
  is_sold boolean null default false,
  constraint plots_pkey primary key (id)
) TABLESPACE pg_default;