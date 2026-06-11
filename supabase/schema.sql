-- Mastical OS Supabase schema
-- Run once in Supabase SQL Editor after creating the project.
-- It creates the app tables used by workspace, social hub, clipper, team,
-- and bot persistence. Row-level security keeps each user's workspace data
-- private once authentication is enabled.

create extension if not exists pgcrypto;

-- Legacy/local canvas tables kept for backwards compatibility.
create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null default '',
  content_type text not null default 'general',
  category text,
  annotation text,
  confidence numeric,
  sources jsonb,
  influenced_by jsonb,
  is_unrelated boolean default false,
  is_pinned boolean default false,
  sub_tasks jsonb,
  images jsonb,
  timestamp bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ghost_notes (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  category text not null,
  created_at timestamptz not null default now()
);

-- Core agency workspace.
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  tagline text,
  description text,
  tone_of_voice text,
  target_demographics text,
  unique_value_prop text,
  competitor_notes text,
  logo_url text,
  brand_colors text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  description text,
  brief text,
  objectives text[],
  target_audience text,
  budget numeric,
  start_date timestamptz,
  end_date timestamptz,
  channels text[],
  content_count integer,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null check (type in ('social_post', 'ad', 'email', 'blog', 'video_script')),
  platform text not null,
  title text,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null,
  metric_type text not null check (metric_type in ('engagement', 'reach', 'impressions', 'clicks', 'conversions')),
  value numeric not null,
  date date not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Team collaboration.
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'editor', 'viewer')),
  invited_by uuid references auth.users(id),
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action_type text not null check (action_type in ('create', 'update', 'delete', 'publish', 'comment', 'invite', 'join')),
  resource_type text not null check (resource_type in ('campaign', 'content', 'member', 'workspace')),
  resource_id text,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  resource_type text not null check (resource_type in ('campaign', 'content')),
  resource_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.presence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid,
  status text check (status in ('active', 'typing', 'away')),
  last_seen timestamptz not null default now()
);

-- Social publishing.
create table if not exists public.social_credentials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'x', 'reddit', 'substack')),
  access_token text not null,
  refresh_token text,
  expires_at bigint,
  account_id text,
  account_username text,
  scopes text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, platform)
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'x', 'reddit', 'substack')),
  text text not null,
  media_urls text[],
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_at timestamptz,
  posted_at timestamptz,
  url text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_analytics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'x', 'reddit', 'substack')),
  post_id uuid references public.social_posts(id) on delete set null,
  metric_type text not null check (metric_type in ('followers', 'engagement', 'reach', 'impressions')),
  value numeric not null,
  date date not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Clipper.
create table if not exists public.clip_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  video_url text not null,
  title text not null,
  segments jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  video_url text not null,
  title text not null,
  description text,
  segment_start integer not null,
  segment_end integer not null,
  duration integer,
  thumbnail_url text,
  download_url text,
  status text not null default 'ready' check (status in ('ready', 'editing', 'posted', 'archived')),
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clip_queue (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  clip_id uuid not null references public.clips(id) on delete cascade,
  platforms text[] not null default array[]::text[],
  scheduled_at timestamptz,
  posted_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'failed')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clip_analytics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  clip_id uuid not null references public.clips(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'x', 'reddit', 'tiktok')),
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  reach integer default 0,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-clipper.
create table if not exists public.auto_clipper_config (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  run_daily_at text default '09:00',
  categories text[] default array['trending']::text[],
  keywords text[] default array[]::text[],
  platforms text[] not null default array['x']::text[],
  clips_per_day integer not null default 3,
  auto_post boolean not null default false,
  max_video_duration integer not null default 600,
  min_views integer not null default 100000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auto_clipper_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null unique,
  status text not null check (status in ('pending', 'running', 'completed', 'failed')),
  videos_found integer default 0,
  clips_created integer default 0,
  clips_posted integer default 0,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auto_clipper_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  job_id uuid not null references public.auto_clipper_jobs(id) on delete cascade,
  run_number integer not null,
  videos_processed integer not null default 0,
  clips_generated integer not null default 0,
  clips_failed integer not null default 0,
  posts_sent integer not null default 0,
  posts_failed integer not null default 0,
  duration_seconds integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Bot conversations.
create table if not exists public.bot_turns (
  id bigserial primary key,
  phone text not null,
  role text not null check (role in ('user', 'assistant')),
  text text not null default '',
  images jsonb,
  created_at timestamptz not null default now()
);

-- Helpful indexes.
create index if not exists blocks_project_idx on public.blocks(project_id);
create index if not exists blocks_user_idx on public.blocks(user_id);
create index if not exists workspaces_user_idx on public.workspaces(user_id);
create index if not exists workspaces_slug_idx on public.workspaces(slug);
create index if not exists brand_profiles_workspace_idx on public.brand_profiles(workspace_id);
create index if not exists campaigns_workspace_idx on public.campaigns(workspace_id);
create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaigns_created_idx on public.campaigns(created_at desc);
create index if not exists content_workspace_idx on public.content(workspace_id);
create index if not exists content_status_idx on public.content(status);
create index if not exists content_type_idx on public.content(type);
create index if not exists analytics_workspace_idx on public.analytics(workspace_id);
create index if not exists analytics_date_idx on public.analytics(date);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists activity_workspace_idx on public.activity_log(workspace_id);
create index if not exists comments_resource_idx on public.comments(resource_type, resource_id);
create index if not exists presence_user_idx on public.presence(user_id);
create index if not exists social_posts_workspace_idx on public.social_posts(workspace_id);
create index if not exists social_posts_status_idx on public.social_posts(status);
create index if not exists social_analytics_date_idx on public.social_analytics(date);
create index if not exists clip_tasks_workspace_idx on public.clip_tasks(workspace_id);
create index if not exists clips_workspace_idx on public.clips(workspace_id);
create index if not exists clip_queue_status_idx on public.clip_queue(status);
create index if not exists clip_analytics_date_idx on public.clip_analytics(date desc);
create index if not exists auto_config_enabled_idx on public.auto_clipper_config(enabled);
create index if not exists auto_jobs_created_idx on public.auto_clipper_jobs(created_at desc);
create index if not exists auto_runs_job_idx on public.auto_clipper_runs(job_id);
create index if not exists bot_turns_phone_idx on public.bot_turns(phone, created_at);

-- Row-level security.
alter table public.projects enable row level security;
alter table public.blocks enable row level security;
alter table public.ghost_notes enable row level security;
alter table public.workspaces enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.content enable row level security;
alter table public.analytics enable row level security;
alter table public.workspace_members enable row level security;
alter table public.activity_log enable row level security;
alter table public.comments enable row level security;
alter table public.presence enable row level security;
alter table public.social_credentials enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_analytics enable row level security;
alter table public.clip_tasks enable row level security;
alter table public.clips enable row level security;
alter table public.clip_queue enable row level security;
alter table public.clip_analytics enable row level security;
alter table public.auto_clipper_config enable row level security;
alter table public.auto_clipper_jobs enable row level security;
alter table public.auto_clipper_runs enable row level security;
alter table public.bot_turns enable row level security;

-- Drop old policies so this file can be re-run safely.
drop policy if exists "own projects" on public.projects;
drop policy if exists "own blocks" on public.blocks;
drop policy if exists "own ghost_notes" on public.ghost_notes;
drop policy if exists "own workspaces" on public.workspaces;
drop policy if exists "workspace_brand_profiles" on public.brand_profiles;
drop policy if exists "workspace_campaigns" on public.campaigns;
drop policy if exists "workspace_content" on public.content;
drop policy if exists "workspace_analytics" on public.analytics;
drop policy if exists "workspace_members_read" on public.workspace_members;
drop policy if exists "workspace_members_manage" on public.workspace_members;
drop policy if exists "activity_read" on public.activity_log;
drop policy if exists "activity_create" on public.activity_log;
drop policy if exists "comments_read" on public.comments;
drop policy if exists "comments_write" on public.comments;
drop policy if exists "presence_read" on public.presence;
drop policy if exists "presence_write" on public.presence;
drop policy if exists "workspace_social_creds" on public.social_credentials;
drop policy if exists "workspace_social_posts" on public.social_posts;
drop policy if exists "workspace_social_analytics" on public.social_analytics;
drop policy if exists "clip_tasks_access" on public.clip_tasks;
drop policy if exists "clips_access" on public.clips;
drop policy if exists "clip_queue_access" on public.clip_queue;
drop policy if exists "clip_analytics_read" on public.clip_analytics;
drop policy if exists "clip_analytics_write" on public.clip_analytics;
drop policy if exists "auto_config_access" on public.auto_clipper_config;
drop policy if exists "auto_jobs_access" on public.auto_clipper_jobs;
drop policy if exists "auto_runs_access" on public.auto_clipper_runs;

create policy "own projects" on public.projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own blocks" on public.blocks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ghost_notes" on public.ghost_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own workspaces" on public.workspaces for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workspace_brand_profiles" on public.brand_profiles for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "workspace_campaigns" on public.campaigns for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "workspace_content" on public.content for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "workspace_analytics" on public.analytics for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "workspace_members_read" on public.workspace_members for select
  using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
    or user_id = auth.uid()
  );
create policy "workspace_members_manage" on public.workspace_members for all
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
create policy "activity_read" on public.activity_log for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "activity_create" on public.activity_log for insert
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "comments_read" on public.comments for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "comments_write" on public.comments for insert
  with check (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
    and user_id = auth.uid()
  );
create policy "presence_read" on public.presence for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "presence_write" on public.presence for all
  using (
    user_id = auth.uid()
    and workspace_id in (select id from public.workspaces where user_id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    and workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "workspace_social_creds" on public.social_credentials for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "workspace_social_posts" on public.social_posts for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "workspace_social_analytics" on public.social_analytics for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "clip_tasks_access" on public.clip_tasks for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "clips_access" on public.clips for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "clip_queue_access" on public.clip_queue for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "clip_analytics_read" on public.clip_analytics for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "clip_analytics_write" on public.clip_analytics for insert
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "auto_config_access" on public.auto_clipper_config for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "auto_jobs_access" on public.auto_clipper_jobs for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));
create policy "auto_runs_access" on public.auto_clipper_runs for all
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

-- No bot_turns policy: only service-role server code can read/write bot memory.
