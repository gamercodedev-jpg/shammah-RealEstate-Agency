-- Add audio and video support to Plots
ALTER TABLE plots 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS audio_url text;

-- Add audio and video support to News
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS audio_url text;
