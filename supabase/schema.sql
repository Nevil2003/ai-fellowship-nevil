-- ────────────────────────────────────────────────────────────────────
-- Propstical Canvas — Supabase schema
-- ────────────────────────────────────────────────────────────────────
-- Run this once in Supabase SQL Editor (Project → SQL → New Query).
-- Mirrors the .nodepad JSON shape so localStorage projects round-trip
-- cleanly to the cloud.  Row-level security isolates each user's data.
-- ────────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id          text        primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.blocks (
  id            text        primary key,
  project_id    text        not null references public.projects(id) on delete cascade,
  user_id       uuid        not null references auth.users(id)     on delete cascade,
  text          text        not null default '',
  content_type  text        not null default 'general',
  category      text,
  annotation    text,
  confidence    numeric,
  sources       jsonb,
  influenced_by jsonb,
  is_unrelated  boolean     default false,
  is_pinned     boolean     default false,
  sub_tasks     jsonb,
  images        jsonb,
  timestamp     bigint      not null,
  created_at    timestamptz not null default now()
);

create index if not exists blocks_project_idx on public.blocks (project_id);
create index if not exists blocks_user_idx    on public.blocks (user_id);

create table if not exists public.ghost_notes (
  id           text        primary key,
  project_id   text        not null references public.projects(id) on delete cascade,
  user_id      uuid        not null references auth.users(id)     on delete cascade,
  text         text        not null,
  category     text        not null,
  created_at   timestamptz not null default now()
);

-- ── Row-Level Security ──────────────────────────────────────────────
alter table public.projects    enable row level security;
alter table public.blocks      enable row level security;
alter table public.ghost_notes enable row level security;

create policy "own projects"    on public.projects    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own blocks"      on public.blocks      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ghost_notes" on public.ghost_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── WhatsApp bot conversations ──────────────────────────────────────
-- Keyed by E.164 phone number, not auth.uid — bot users are not
-- logged in.  Only the server (service role) writes here; anon role
-- cannot read/write so RLS stays deny-by-default.
create table if not exists public.bot_turns (
  id         bigserial   primary key,
  phone      text        not null,
  role       text        not null check (role in ('user', 'assistant')),
  text       text        not null default '',
  images     jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bot_turns_phone_idx on public.bot_turns (phone, created_at);

alter table public.bot_turns enable row level security;
-- No policies added => only the service_role key can read/write.
