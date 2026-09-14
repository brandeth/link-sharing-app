-- Profiles, links and avatars for the link-sharing app.
--
-- Run once against the project: paste into the Supabase dashboard's SQL
-- Editor, or `supabase db push` with the CLI. Safe to re-run.
--
-- Every table has row-level security on, and each user can only reach
-- their own rows. The browser talks to the database directly with the
-- publishable key, so these policies are the only thing protecting the
-- data.

-- ─── Profiles ──────────────────────────────────────────────────────
-- One row per account, keyed by the auth user. Created by the first
-- save, not at sign-up. Empty strings rather than nulls, matching the
-- app's own "empty means not filled in".
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text not null default '',
  last_name   text not null default '',
  email       text not null default '',
  avatar_url  text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, insert, update on public.profiles to authenticated;

-- ─── Links ─────────────────────────────────────────────────────────
-- The id comes from the app (crypto.randomUUID), which already uses it
-- as the list key. `position` keeps the user's order.
create table if not exists public.links (
  id        uuid primary key,
  user_id   uuid not null references auth.users (id) on delete cascade,
  platform  text not null,
  url       text not null,
  position  integer not null
);

create index if not exists links_user_id_position_idx on public.links (user_id, position);

alter table public.links enable row level security;

drop policy if exists "Users can read their own links" on public.links;
create policy "Users can read their own links"
  on public.links for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own links" on public.links;
create policy "Users can create their own links"
  on public.links for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own links" on public.links;
create policy "Users can delete their own links"
  on public.links for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.links to authenticated;

-- Replaces the caller's whole list in one transaction, in the order
-- given. `security invoker` runs it as the caller, so the policies above
-- still apply, and the user is taken from the session rather than
-- trusted from the arguments.
create or replace function public.save_links(items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  delete from public.links where user_id = auth.uid();

  insert into public.links (id, user_id, platform, url, position)
  select (item ->> 'id')::uuid, auth.uid(), item ->> 'platform', item ->> 'url', (ordinality - 1)::integer
  from jsonb_array_elements(items) with ordinality as t (item, ordinality);
end;
$$;

revoke execute on function public.save_links (jsonb) from public, anon;
grant execute on function public.save_links (jsonb) to authenticated;

-- ─── Avatars ───────────────────────────────────────────────────────
-- A public bucket, so an avatar URL works in an <img> without a signed
-- token. Each user writes only inside a folder named after their id
-- (`<user id>/avatar`). The limits mirror the profile form's own rules.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Uploading with `upsert` needs select and update as well as insert.
drop policy if exists "Users can read their own avatar" on storage.objects;
create policy "Users can read their own avatar"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can replace their own avatar" on storage.objects;
create policy "Users can replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
