-- RSVP platform schema
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  event_date date,
  start_time time,
  end_time time,
  location text,
  address text,
  maps_url text,
  cover_image_url text,
  host_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed', 'archived')),
  theme_preset text not null default 'custom',
  form_schema jsonb not null default '{"sections":[]}'::jsonb,
  theme_config jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  guest_name text,
  guest_email text,
  attendance text not null default 'unknown' check (attendance in ('attending', 'not_attending', 'maybe', 'unknown')),
  guest_count integer not null default 0,
  status text not null default 'submitted' check (status in ('submitted', 'updated', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text not null default 'Custom',
  form_schema jsonb not null,
  theme_preset text not null default 'custom',
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_id uuid references public.events(id) on delete cascade,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_status_idx on public.events(status);
create index if not exists form_responses_event_id_idx on public.form_responses(event_id);
create index if not exists form_responses_created_at_idx on public.form_responses(created_at desc);
create index if not exists activity_logs_user_id_idx on public.activity_logs(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists form_responses_updated_at on public.form_responses;
create trigger form_responses_updated_at before update on public.form_responses
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.form_responses enable row level security;
alter table public.form_templates enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles self" on public.profiles;
create policy "profiles self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "events owner" on public.events;
create policy "events owner" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "events public read published" on public.events;
create policy "events public read published" on public.events
  for select using (status in ('published', 'closed'));

drop policy if exists "responses owner" on public.form_responses;
create policy "responses owner" on public.form_responses
  for all using (
    exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
  );

drop policy if exists "responses public insert" on public.form_responses;
create policy "responses public insert" on public.form_responses
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.status = 'published'
    )
  );

drop policy if exists "templates readable" on public.form_templates;
create policy "templates readable" on public.form_templates
  for select using (is_system = true or user_id = auth.uid());

drop policy if exists "templates owner write" on public.form_templates;
create policy "templates owner write" on public.form_templates
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "activity owner" on public.activity_logs;
create policy "activity owner" on public.activity_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('event-assets', 'event-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('rsvp-uploads', 'rsvp-uploads', false)
on conflict (id) do nothing;

drop policy if exists "event assets owner" on storage.objects;
create policy "event assets owner" on storage.objects
  for all using (bucket_id = 'event-assets' and auth.role() = 'authenticated')
  with check (bucket_id = 'event-assets' and auth.role() = 'authenticated');

drop policy if exists "event assets public read" on storage.objects;
create policy "event assets public read" on storage.objects
  for select using (bucket_id = 'event-assets');

drop policy if exists "rsvp uploads insert" on storage.objects;
create policy "rsvp uploads insert" on storage.objects
  for insert with check (bucket_id = 'rsvp-uploads');
