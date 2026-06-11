-- ────────────────────────────────────────────────────────────────────
-- Social Platform Credentials & Posts
-- ────────────────────────────────────────────────────────────────────
-- Add to Supabase after schema-agency.sql

-- ── Social Credentials ──────────────────────────────────────────────
create table if not exists public.social_credentials (
  id            uuid        primary key default gen_random_uuid(),
  workspace_id  uuid        not null references public.workspaces(id) on delete cascade,
  platform      text        not null check (platform in ('instagram', 'x', 'reddit', 'substack')),
  access_token  text        not null,
  refresh_token text,
  expires_at    bigint,
  account_id    text,
  account_username text,
  scopes        text[],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists social_creds_unique on public.social_credentials(workspace_id, platform);
create index if not exists social_creds_workspace_idx on public.social_credentials(workspace_id);

-- ── Social Posts (scheduled/posted) ─────────────────────────────────
create table if not exists public.social_posts (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  platform        text        not null check (platform in ('instagram', 'x', 'reddit', 'substack')),
  text            text        not null,
  media_urls      text[],
  status          text        not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_at    timestamptz,
  posted_at       timestamptz,
  url             text,
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists social_posts_workspace_idx on public.social_posts(workspace_id);
create index if not exists social_posts_platform_idx on public.social_posts(platform);
create index if not exists social_posts_status_idx on public.social_posts(status);
create index if not exists social_posts_scheduled_idx on public.social_posts(scheduled_at) where status = 'scheduled';

-- ── Social Analytics ────────────────────────────────────────────────
create table if not exists public.social_analytics (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  platform        text        not null check (platform in ('instagram', 'x', 'reddit', 'substack')),
  post_id         uuid        references public.social_posts(id) on delete set null,
  metric_type     text        not null check (metric_type in ('followers', 'engagement', 'reach', 'impressions')),
  value           numeric     not null,
  date            date        not null,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists social_analytics_workspace_idx on public.social_analytics(workspace_id);
create index if not exists social_analytics_platform_idx on public.social_analytics(platform);
create index if not exists social_analytics_date_idx on public.social_analytics(date);

-- ── Row-Level Security ──────────────────────────────────────────────
alter table public.social_credentials enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_analytics enable row level security;

create policy "workspace_social_creds" on public.social_credentials
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "workspace_social_posts" on public.social_posts
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "workspace_social_analytics" on public.social_analytics
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );
