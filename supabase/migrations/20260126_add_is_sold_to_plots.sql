-- Adds sold flag to property listings
-- NOTE: App uses the `plots` table for properties.

alter table if exists public.plots
add column if not exists is_sold boolean not null default false;
