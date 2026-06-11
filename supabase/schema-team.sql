-- ────────────────────────────────────────────────────────────────────
-- Team Collaboration
-- ────────────────────────────────────────────────────────────────────

-- ── Workspace Members ───────────────────────────────────────────────
create table if not exists public.workspace_members (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  role            text        not null default 'member' check (role in ('owner', 'admin', 'editor', 'viewer')),
  invited_by      uuid        references auth.users(id),
  invited_at      timestamptz,
  accepted_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists workspace_members_unique on public.workspace_members(workspace_id, user_id);
create index if not exists workspace_members_workspace_idx on public.workspace_members(workspace_id);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

-- ── Activity Log ────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        references auth.users(id) on delete set null,
  action_type     text        not null check (action_type in ('create', 'update', 'delete', 'publish', 'comment', 'invite', 'join')),
  resource_type   text        not null check (resource_type in ('campaign', 'content', 'member', 'workspace')),
  resource_id     text,
  description     text,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists activity_workspace_idx on public.activity_log(workspace_id);
create index if not exists activity_user_idx on public.activity_log(user_id);
create index if not exists activity_resource_idx on public.activity_log(resource_type, resource_id);
create index if not exists activity_created_idx on public.activity_log(created_at desc);

-- ── Comments on Campaigns/Content ───────────────────────────────────
create table if not exists public.comments (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  resource_type   text        not null check (resource_type in ('campaign', 'content')),
  resource_id     uuid        not null,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  text            text        not null,
  parent_id       uuid        references public.comments(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists comments_workspace_idx on public.comments(workspace_id);
create index if not exists comments_resource_idx on public.comments(resource_type, resource_id);
create index if not exists comments_user_idx on public.comments(user_id);
create index if not exists comments_created_idx on public.comments(created_at desc);

-- ── Real-time Presence (who's typing, active) ──────────────────────
create table if not exists public.presence (
  id              uuid        primary key default gen_random_uuid(),
  workspace_id    uuid        not null references public.workspaces(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  resource_id     uuid,
  status          text        check (status in ('active', 'typing', 'away')),
  last_seen       timestamptz not null default now()
);

create index if not exists presence_workspace_idx on public.presence(workspace_id);
create index if not exists presence_user_idx on public.presence(user_id);

-- ── Row-Level Security ──────────────────────────────────────────────
alter table public.workspace_members enable row level security;
alter table public.activity_log enable row level security;
alter table public.comments enable row level security;
alter table public.presence enable row level security;

-- Workspace members are visible to workspace members
create policy "workspace_members_read" on public.workspace_members
  for select using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "workspace_members_manage" on public.workspace_members
  for all using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Activity log visible to workspace members
create policy "activity_read" on public.activity_log
  for select using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "activity_create" on public.activity_log
  for insert with check (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

-- Comments visible to workspace members
create policy "comments_read" on public.comments
  for select using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "comments_write" on public.comments
  for insert with check (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
    and user_id = auth.uid()
  );

-- Presence updates
create policy "presence_read" on public.presence
  for select using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

create policy "presence_write" on public.presence
  for all using (
    user_id = auth.uid()
    and workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );
