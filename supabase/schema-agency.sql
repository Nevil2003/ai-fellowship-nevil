-- ────────────────────────────────────────────────────────────────────
-- Mastical OS Agency Schema
-- ────────────────────────────────────────────────────────────────────
-- Run this AFTER schema.sql to add agency-specific tables.
-- All tables support multi-tenant workspaces with RLS policies.

-- ── Workspaces (Teams) ──────────────────────────────────────────────
create table if not exists public.workspaces (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  name          text        not null,
  slug          text        not null unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists workspaces_user_idx on public.workspaces(user_id);
create index if not exists workspaces_slug_idx on public.workspaces(slug);

-- ── Brand Profiles ──────────────────────────────────────────────────
create table if not exists public.brand_profiles (
  id                    uuid        primary key default gen_random_uuid(),
  workspace_id          uuid        not null references public.workspaces(id) on delete cascade,
  name                  text        not null,
  tagline               text,
  description           text,
  tone_of_voice         text,
  target_demographics   text,
  unique_value_prop     text,
  competitor_notes      text,
  logo_url              text,
  brand_colors          text[],
  metadata              jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists brand_profiles_workspace_idx on public.brand_profiles(workspace_id);

-- ── Campaigns ───────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  name            text        not null,
  status          text        not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  description     text,
  brief           text,
  objectives      text[],
  target_audience text,
  budget          numeric,
  start_date      timestamptz,
  end_date        timestamptz,
  channels        text[],
  content_count   integer,
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists campaigns_workspace_idx on public.campaigns(workspace_id);
create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaigns_created_idx on public.campaigns(created_at desc);

-- ── Content ─────────────────────────────────────────────────────────
create table if not exists public.content (
  id              uuid        primary key default gen_random_uuid(),
  campaign_id     uuid        not null references public.campaigns(id) on delete cascade,
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  type            text        not null check (type in ('social_post', 'ad', 'email', 'blog', 'video_script')),
  platform        text        not null,
  title           text,
  body            text        not null,
  status          text        not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create index if not exists content_campaign_idx on public.content(campaign_id);
create index if not exists content_workspace_idx on public.content(workspace_id);
create index if not exists content_status_idx on public.content(status);
create index if not exists content_type_idx on public.content(type);
create index if not exists content_platform_idx on public.content(platform);

-- ── Analytics ───────────────────────────────────────────────────────
create table if not exists public.analytics (
  id              uuid        primary key default gen_random_uuid(),
  content_id      uuid        not null references public.content(id) on delete cascade,
  campaign_id     uuid        not null references public.campaigns(id) on delete cascade,
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  platform        text        not null,
  metric_type     text        not null check (metric_type in ('engagement', 'reach', 'impressions', 'clicks', 'conversions')),
  value           numeric     not null,
  date            date        not null,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists analytics_content_idx on public.analytics(content_id);
create index if not exists analytics_campaign_idx on public.analytics(campaign_id);
create index if not exists analytics_workspace_idx on public.analytics(workspace_id);
create index if not exists analytics_date_idx on public.analytics(date);
create index if not exists analytics_metric_idx on public.analytics(metric_type);

-- ── Row-Level Security ──────────────────────────────────────────────
alter table public.workspaces enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.content enable row level security;
alter table public.analytics enable row level security;

-- Users own their workspaces
create policy "own workspaces" on public.workspaces
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users can access workspace data they own
create policy "workspace_brand_profiles" on public.brand_profiles
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "workspace_campaigns" on public.campaigns
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "workspace_content" on public.content
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "workspace_analytics" on public.analytics
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );
