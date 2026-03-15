create extension if not exists pgcrypto;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  video_url text,
  audio_url text,
  created_at timestamptz default now()
);

alter table public.news enable row level security;

drop policy if exists "Public can read news" on public.news;

create policy "Public can read news"
on public.news
for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values
  ('news-images', 'news-images', true),
  ('news-videos', 'news-videos', true),
  ('news-audio', 'news-audio', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view news images" on storage.objects;
drop policy if exists "Authenticated can upload news images" on storage.objects;
drop policy if exists "Authenticated can update news images" on storage.objects;
drop policy if exists "Authenticated can delete news images" on storage.objects;

create policy "Public can view news images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'news-images');

create policy "Authenticated can upload news images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'news-images');

create policy "Authenticated can update news images"
on storage.objects
for update
to authenticated
using (bucket_id = 'news-images')
with check (bucket_id = 'news-images');

create policy "Authenticated can delete news images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'news-images');

drop policy if exists "Public can view news videos" on storage.objects;
drop policy if exists "Authenticated can upload news videos" on storage.objects;
drop policy if exists "Authenticated can update news videos" on storage.objects;
drop policy if exists "Authenticated can delete news videos" on storage.objects;

create policy "Public can view news videos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'news-videos');

create policy "Authenticated can upload news videos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'news-videos');

create policy "Authenticated can update news videos"
on storage.objects
for update
to authenticated
using (bucket_id = 'news-videos')
with check (bucket_id = 'news-videos');

create policy "Authenticated can delete news videos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'news-videos');

drop policy if exists "Public can view news audio" on storage.objects;
drop policy if exists "Authenticated can upload news audio" on storage.objects;
drop policy if exists "Authenticated can update news audio" on storage.objects;
drop policy if exists "Authenticated can delete news audio" on storage.objects;

create policy "Public can view news audio"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'news-audio');

create policy "Authenticated can upload news audio"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'news-audio');

create policy "Authenticated can update news audio"
on storage.objects
for update
to authenticated
using (bucket_id = 'news-audio')
with check (bucket_id = 'news-audio');

create policy "Authenticated can delete news audio"
on storage.objects
for delete
to authenticated
using (bucket_id = 'news-audio');