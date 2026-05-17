-- Mr Scale — Supabase Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension (enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- ─── users ────────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific profile data.
-- The id column references auth.users so that deleting an auth user
-- cascades to this table automatically.

create table public.users (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  name           text,
  role           text not null default 'client' check (role in ('admin', 'client')),
  package        text check (package in ('starter', 'growth', 'retainer')),
  instagram_handle text,
  niche          text,
  main_offer     text,
  target_audience text,
  tone_of_voice  text,
  revenue_goal   text,
  pain_points    text,
  stripe_key     text,
  calendly_token text,
  created_at     timestamptz not null default now()
);

-- Row-level security
alter table public.users enable row level security;

-- Admins can read/write all users; clients can only read their own row.
create policy "Users: admin full access"
  on public.users
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "Users: client read own"
  on public.users
  for select
  using (id = auth.uid());

create policy "Users: client update own"
  on public.users
  for update
  using (id = auth.uid());


-- ─── notifications ────────────────────────────────────────────────────────────

create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  client_id  uuid not null references public.users(id) on delete cascade,
  title      text not null,
  message    text,
  type       text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Notifications: admin full access"
  on public.notifications
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "Notifications: client read own"
  on public.notifications
  for select
  using (client_id = auth.uid());

create policy "Notifications: client update own (mark read)"
  on public.notifications
  for update
  using (client_id = auth.uid());


-- ─── operator_notes ───────────────────────────────────────────────────────────

create table public.operator_notes (
  id         uuid primary key default uuid_generate_v4(),
  client_id  uuid not null references public.users(id) on delete cascade,
  note       text not null,
  created_at timestamptz not null default now()
);

alter table public.operator_notes enable row level security;

-- Only admins can read/write operator notes (hidden from clients)
create policy "OperatorNotes: admin full access"
  on public.operator_notes
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );


-- ─── Trigger: auto-create user profile on auth signup ─────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index notifications_client_id_idx on public.notifications(client_id);
create index notifications_read_idx on public.notifications(read);
create index operator_notes_client_id_idx on public.operator_notes(client_id);
