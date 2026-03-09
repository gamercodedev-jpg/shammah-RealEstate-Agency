-- Add size_sqm column to plots
ALTER TABLE public.plots
ADD COLUMN IF NOT EXISTS size_sqm numeric;
