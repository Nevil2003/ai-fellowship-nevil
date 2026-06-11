-- ────────────────────────────────────────────────────────────────────
-- Video Clipper Tables
-- ────────────────────────────────────────────────────────────────────

-- ── Clip Tasks ──────────────────────────────────────────────────────
create table if not exists public.clip_tasks (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  video_url       text        not null,
  title           text        not null,
  segments        jsonb       not null,
  status          text        not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists clip_tasks_workspace_idx on public.clip_tasks(workspace_id);
create index if not exists clip_tasks_user_idx on public.clip_tasks(user_id);
create index if not exists clip_tasks_status_idx on public.clip_tasks(status);
create index if not exists clip_tasks_created_idx on public.clip_tasks(created_at desc);

-- ── Clips ───────────────────────────────────────────────────────────
create table if not exists public.clips (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  video_url       text        not null,
  title           text        not null,
  description     text,
  segment_start   integer     not null,
  segment_end     integer     not null,
  duration        integer,
  thumbnail_url   text,
  download_url    text,
  status          text        not null default 'ready' check (status in ('ready', 'editing', 'posted', 'archived')),
  posted_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists clips_workspace_idx on public.clips(workspace_id);
create index if not exists clips_user_idx on public.clips(user_id);
create index if not exists clips_status_idx on public.clips(status);
create index if not exists clips_created_idx on public.clips(created_at desc);

-- ── Clip Queue (for posting) ────────────────────────────────────────
create table if not exists public.clip_queue (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  clip_id         uuid        not null references public.clips(id) on delete cascade,
  platforms       text[]      not null default array[]::text[],
  scheduled_at    timestamptz,
  posted_at       timestamptz,
  status          text        not null default 'draft' check (status in ('draft', 'scheduled', 'posted', 'failed')),
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists clip_queue_workspace_idx on public.clip_queue(workspace_id);
create index if not exists clip_queue_user_idx on public.clip_queue(user_id);
create index if not exists clip_queue_status_idx on public.clip_queue(status);
create index if not exists clip_queue_scheduled_idx on public.clip_queue(scheduled_at) where status = 'scheduled';

-- ── Clip Performance Analytics ──────────────────────────────────────
create table if not exists public.clip_analytics (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  clip_id         uuid        not null references public.clips(id) on delete cascade,
  platform        text        not null check (platform in ('instagram', 'x', 'reddit', 'tiktok')),
  views           integer     default 0,
  likes           integer     default 0,
  comments        integer     default 0,
  shares          integer     default 0,
  reach           integer     default 0,
  date            date        not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists clip_analytics_workspace_idx on public.clip_analytics(workspace_id);
create index if not exists clip_analytics_clip_idx on public.clip_analytics(clip_id);
create index if not exists clip_analytics_platform_idx on public.clip_analytics(platform);
create index if not exists clip_analytics_date_idx on public.clip_analytics(date desc);

-- ── Row-Level Security ──────────────────────────────────────────────
alter table public.clip_tasks enable row level security;
alter table public.clips enable row level security;
alter table public.clip_queue enable row level security;
alter table public.clip_analytics enable row level security;

create policy "clip_tasks_access" on public.clip_tasks
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "clips_access" on public.clips
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "clip_queue_access" on public.clip_queue
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "clip_analytics_read" on public.clip_analytics
  for select using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "clip_analytics_write" on public.clip_analytics
  for insert with check (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );
