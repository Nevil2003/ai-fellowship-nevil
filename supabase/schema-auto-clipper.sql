-- ────────────────────────────────────────────────────────────────────
-- Auto-Clipper Configuration & Jobs
-- ────────────────────────────────────────────────────────────────────

-- ── Auto-Clipper Configuration ──────────────────────────────────────
create table if not exists public.auto_clipper_config (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null unique references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  enabled         boolean     not null default false,
  run_daily_at    text        default '09:00',
  categories      text[]      default array['trending']::text[],
  keywords        text[]      default array[]::text[],
  platforms       text[]      not null default array['x']::text[],
  clips_per_day   integer     not null default 3,
  auto_post       boolean     not null default false,
  max_video_duration integer  not null default 600,
  min_views       integer     not null default 100000,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists auto_config_workspace_idx on public.auto_clipper_config(workspace_id);
create index if not exists auto_config_enabled_idx on public.auto_clipper_config(enabled);

-- ── Auto-Clipper Jobs ──────────────────────────────────────────────
create table if not exists public.auto_clipper_jobs (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  job_id          text        not null unique,
  status          text        not null check (status in ('pending', 'running', 'completed', 'failed')),
  videos_found    integer     default 0,
  clips_created   integer     default 0,
  clips_posted    integer     default 0,
  error           text,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists auto_jobs_workspace_idx on public.auto_clipper_jobs(workspace_id);
create index if not exists auto_jobs_status_idx on public.auto_clipper_jobs(status);
create index if not exists auto_jobs_created_idx on public.auto_clipper_jobs(created_at desc);

-- ── Auto-Clipper Run History ────────────────────────────────────────
create table if not exists public.auto_clipper_runs (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  job_id          uuid        not null references public.auto_clipper_jobs(id) on delete cascade,
  run_number      integer     not null,
  videos_processed integer    not null default 0,
  clips_generated integer     not null default 0,
  clips_failed    integer     not null default 0,
  posts_sent      integer     not null default 0,
  posts_failed    integer     not null default 0,
  duration_seconds integer    not null default 0,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists auto_runs_workspace_idx on public.auto_clipper_runs(workspace_id);
create index if not exists auto_runs_job_idx on public.auto_clipper_runs(job_id);

-- ── Row-Level Security ──────────────────────────────────────────────
alter table public.auto_clipper_config enable row level security;
alter table public.auto_clipper_jobs enable row level security;
alter table public.auto_clipper_runs enable row level security;

create policy "auto_config_access" on public.auto_clipper_config
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "auto_jobs_access" on public.auto_clipper_jobs
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "auto_runs_access" on public.auto_clipper_runs
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );
