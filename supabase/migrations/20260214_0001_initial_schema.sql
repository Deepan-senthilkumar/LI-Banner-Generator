begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  create type public.user_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.plan_tier as enum ('free', 'pro');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.template_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.invite_status as enum ('pending', 'accepted', 'expired', 'revoked');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email citext not null unique,
  role public.user_role not null default 'user',
  plan public.plan_tier not null default 'free',
  is_pro boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.enforce_user_row_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and auth.uid() = old.id and not public.current_user_is_admin() then
    new.role := old.role;
    new.plan := old.plan;
  end if;

  new.is_pro := (new.plan = 'pro');
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, plan, is_pro)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    'user',
    'free',
    false
  )
  on conflict (id) do update
    set email = excluded.email,
        name = case
          when excluded.name <> '' then excluded.name
          else public.users.name
        end;

  return new;
end;
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

drop trigger if exists trg_users_integrity on public.users;
create trigger trg_users_integrity
before insert or update on public.users
for each row
execute function public.enforce_user_row_integrity();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create table if not exists public.templates (
  id text primary key,
  created_by uuid references public.users(id) on delete set null,
  name text not null,
  category text not null default 'minimal',
  style text not null default 'Modern',
  tags text[] not null default '{}',
  premium boolean not null default false,
  featured boolean not null default false,
  status public.template_status not null default 'approved',
  use_count integer not null default 0 check (use_count >= 0),
  thumbnail text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled Banner',
  template_id text references public.templates(id) on delete set null,
  design_data jsonb not null default '{}'::jsonb,
  preview_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.user_projects(id) on delete cascade,
  draft_data jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  palettes jsonb not null default '[]'::jsonb,
  logos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.user_projects(id) on delete cascade,
  share_id text not null unique,
  created_by uuid references public.users(id) on delete set null,
  views integer not null default 0 check (views >= 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email citext not null,
  invited_by uuid references public.users(id) on delete set null,
  token text not null unique,
  status public.invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

create table if not exists public.editor_content_config (
  id smallint primary key default 1 check (id = 1),
  backgrounds jsonb not null default '[]'::jsonb,
  stickers jsonb not null default '[]'::jsonb,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.editor_content_config (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.growth_post_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null default '',
  tone text not null default 'professional',
  audience text not null default 'Hiring managers',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_carousel_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled Carousel',
  slides jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_swipe_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled Swipe',
  source_url text,
  notes text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.growth_engagement_streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_actions integer not null default 0,
  week_progress boolean[] not null default array[false, false, false, false, false, false, false],
  last_active_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_crm_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  title text not null default '',
  company text not null default '',
  stage text not null default 'new' check (stage in ('new', 'contacted', 'qualified', 'won')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  connected boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  plan public.plan_tier not null default 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_monitoring_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  data jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

drop trigger if exists trg_templates_updated_at on public.templates;
create trigger trg_templates_updated_at before update on public.templates for each row execute function public.touch_updated_at();
drop trigger if exists trg_user_projects_updated_at on public.user_projects;
create trigger trg_user_projects_updated_at before update on public.user_projects for each row execute function public.touch_updated_at();
drop trigger if exists trg_project_drafts_updated_at on public.project_drafts;
create trigger trg_project_drafts_updated_at before update on public.project_drafts for each row execute function public.touch_updated_at();
drop trigger if exists trg_brand_kits_updated_at on public.brand_kits;
create trigger trg_brand_kits_updated_at before update on public.brand_kits for each row execute function public.touch_updated_at();
drop trigger if exists trg_shared_links_updated_at on public.shared_links;
create trigger trg_shared_links_updated_at before update on public.shared_links for each row execute function public.touch_updated_at();
drop trigger if exists trg_teams_updated_at on public.teams;
create trigger trg_teams_updated_at before update on public.teams for each row execute function public.touch_updated_at();
drop trigger if exists trg_team_invites_updated_at on public.team_invites;
create trigger trg_team_invites_updated_at before update on public.team_invites for each row execute function public.touch_updated_at();
drop trigger if exists trg_editor_content_config_updated_at on public.editor_content_config;
create trigger trg_editor_content_config_updated_at before update on public.editor_content_config for each row execute function public.touch_updated_at();
drop trigger if exists trg_growth_post_drafts_updated_at on public.growth_post_drafts;
create trigger trg_growth_post_drafts_updated_at before update on public.growth_post_drafts for each row execute function public.touch_updated_at();
drop trigger if exists trg_growth_carousel_decks_updated_at on public.growth_carousel_decks;
create trigger trg_growth_carousel_decks_updated_at before update on public.growth_carousel_decks for each row execute function public.touch_updated_at();
drop trigger if exists trg_growth_engagement_streaks_updated_at on public.growth_engagement_streaks;
create trigger trg_growth_engagement_streaks_updated_at before update on public.growth_engagement_streaks for each row execute function public.touch_updated_at();
drop trigger if exists trg_growth_crm_leads_updated_at on public.growth_crm_leads;
create trigger trg_growth_crm_leads_updated_at before update on public.growth_crm_leads for each row execute function public.touch_updated_at();
drop trigger if exists trg_growth_integrations_updated_at on public.growth_integrations;
create trigger trg_growth_integrations_updated_at before update on public.growth_integrations for each row execute function public.touch_updated_at();
drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at before update on public.subscriptions for each row execute function public.touch_updated_at();

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_user_projects_user_id_updated_at on public.user_projects(user_id, updated_at desc);
create index if not exists idx_user_projects_template_id on public.user_projects(template_id);
create index if not exists idx_templates_status_featured_use_count on public.templates(status, featured, use_count desc);
create index if not exists idx_templates_tags on public.templates using gin(tags);
create index if not exists idx_shared_links_share_id on public.shared_links(share_id);
create index if not exists idx_admin_audit_logs_at on public.admin_audit_logs(at desc);
create index if not exists idx_growth_post_drafts_user_id on public.growth_post_drafts(user_id);
create index if not exists idx_growth_carousel_decks_user_id on public.growth_carousel_decks(user_id);
create index if not exists idx_growth_swipe_files_user_id on public.growth_swipe_files(user_id);
create index if not exists idx_growth_crm_leads_user_id on public.growth_crm_leads(user_id);
create index if not exists idx_growth_integrations_user_provider on public.growth_integrations(user_id, provider);
create index if not exists idx_app_monitoring_events_user_id on public.app_monitoring_events(user_id);
create index if not exists idx_app_monitoring_events_at on public.app_monitoring_events(at desc);

alter table public.users enable row level security;
alter table public.templates enable row level security;
alter table public.user_projects enable row level security;
alter table public.project_drafts enable row level security;
alter table public.brand_kits enable row level security;
alter table public.shared_links enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.editor_content_config enable row level security;
alter table public.growth_post_drafts enable row level security;
alter table public.growth_carousel_decks enable row level security;
alter table public.growth_swipe_files enable row level security;
alter table public.growth_engagement_streaks enable row level security;
alter table public.growth_crm_leads enable row level security;
alter table public.growth_integrations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.app_monitoring_events enable row level security;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin on public.users
for select
using (id = auth.uid() or public.current_user_is_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin on public.users
for update
using (id = auth.uid() or public.current_user_is_admin())
with check (id = auth.uid() or public.current_user_is_admin());

drop policy if exists users_admin_delete on public.users;
create policy users_admin_delete on public.users
for delete
using (public.current_user_is_admin());

drop policy if exists templates_select_approved_or_admin on public.templates;
create policy templates_select_approved_or_admin on public.templates
for select
using (status = 'approved' or public.current_user_is_admin());

drop policy if exists templates_admin_insert on public.templates;
create policy templates_admin_insert on public.templates
for insert
with check (public.current_user_is_admin());

drop policy if exists templates_admin_update on public.templates;
create policy templates_admin_update on public.templates
for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists templates_admin_delete on public.templates;
create policy templates_admin_delete on public.templates
for delete
using (public.current_user_is_admin());

drop policy if exists user_projects_owner_or_admin_select on public.user_projects;
create policy user_projects_owner_or_admin_select on public.user_projects
for select
using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists user_projects_owner_or_admin_insert on public.user_projects;
create policy user_projects_owner_or_admin_insert on public.user_projects
for insert
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists user_projects_owner_or_admin_update on public.user_projects;
create policy user_projects_owner_or_admin_update on public.user_projects
for update
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists user_projects_owner_or_admin_delete on public.user_projects;
create policy user_projects_owner_or_admin_delete on public.user_projects
for delete
using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists project_drafts_owner_or_admin_all on public.project_drafts;
create policy project_drafts_owner_or_admin_all on public.project_drafts
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists brand_kits_owner_or_admin_all on public.brand_kits;
create policy brand_kits_owner_or_admin_all on public.brand_kits
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists shared_links_owner_or_admin_select on public.shared_links;
create policy shared_links_owner_or_admin_select on public.shared_links
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.user_projects p
    where p.id = shared_links.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists shared_links_owner_or_admin_insert on public.shared_links;
create policy shared_links_owner_or_admin_insert on public.shared_links
for insert
with check (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.user_projects p
    where p.id = shared_links.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists shared_links_owner_or_admin_update on public.shared_links;
create policy shared_links_owner_or_admin_update on public.shared_links
for update
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.user_projects p
    where p.id = shared_links.project_id
      and p.user_id = auth.uid()
  )
)
with check (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.user_projects p
    where p.id = shared_links.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists shared_links_owner_or_admin_delete on public.shared_links;
create policy shared_links_owner_or_admin_delete on public.shared_links
for delete
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.user_projects p
    where p.id = shared_links.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists teams_member_or_admin_select on public.teams;
create policy teams_member_or_admin_select on public.teams
for select
using (
  owner_id = auth.uid()
  or public.current_user_is_admin()
  or exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id and tm.user_id = auth.uid()
  )
);

drop policy if exists teams_owner_or_admin_insert on public.teams;
create policy teams_owner_or_admin_insert on public.teams
for insert
with check (owner_id = auth.uid() or public.current_user_is_admin());

drop policy if exists teams_owner_or_admin_update on public.teams;
create policy teams_owner_or_admin_update on public.teams
for update
using (owner_id = auth.uid() or public.current_user_is_admin())
with check (owner_id = auth.uid() or public.current_user_is_admin());

drop policy if exists teams_owner_or_admin_delete on public.teams;
create policy teams_owner_or_admin_delete on public.teams
for delete
using (owner_id = auth.uid() or public.current_user_is_admin());

drop policy if exists team_members_member_or_admin_select on public.team_members;
create policy team_members_member_or_admin_select on public.team_members
for select
using (
  public.current_user_is_admin()
  or user_id = auth.uid()
  or exists (
    select 1 from public.teams t
    where t.id = team_members.team_id
      and t.owner_id = auth.uid()
  )
);

drop policy if exists team_members_owner_or_admin_insert on public.team_members;
create policy team_members_owner_or_admin_insert on public.team_members
for insert
with check (
  public.current_user_is_admin()
  or exists (
    select 1 from public.teams t
    where t.id = team_members.team_id
      and t.owner_id = auth.uid()
  )
);

drop policy if exists team_members_owner_or_admin_update on public.team_members;
create policy team_members_owner_or_admin_update on public.team_members
for update
using (
  public.current_user_is_admin()
  or exists (
    select 1 from public.teams t
    where t.id = team_members.team_id
      and t.owner_id = auth.uid()
  )
)
with check (
  public.current_user_is_admin()
  or exists (
    select 1 from public.teams t
    where t.id = team_members.team_id
      and t.owner_id = auth.uid()
  )
);

drop policy if exists team_members_owner_or_admin_delete on public.team_members;
create policy team_members_owner_or_admin_delete on public.team_members
for delete
using (
  public.current_user_is_admin()
  or exists (
    select 1 from public.teams t
    where t.id = team_members.team_id
      and t.owner_id = auth.uid()
  )
);

drop policy if exists team_invites_owner_or_admin_all on public.team_invites;
create policy team_invites_owner_or_admin_all on public.team_invites
for all
using (
  public.current_user_is_admin()
  or exists (
    select 1 from public.teams t
    where t.id = team_invites.team_id
      and t.owner_id = auth.uid()
  )
)
with check (
  public.current_user_is_admin()
  or exists (
    select 1 from public.teams t
    where t.id = team_invites.team_id
      and t.owner_id = auth.uid()
  )
);

drop policy if exists admin_audit_logs_admin_select on public.admin_audit_logs;
create policy admin_audit_logs_admin_select on public.admin_audit_logs
for select
using (public.current_user_is_admin());

drop policy if exists admin_audit_logs_authenticated_insert on public.admin_audit_logs;
create policy admin_audit_logs_authenticated_insert on public.admin_audit_logs
for insert
with check (auth.uid() is not null);

drop policy if exists editor_content_config_authenticated_select on public.editor_content_config;
create policy editor_content_config_authenticated_select on public.editor_content_config
for select
using (auth.uid() is not null);

drop policy if exists editor_content_config_admin_write on public.editor_content_config;
create policy editor_content_config_admin_write on public.editor_content_config
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists growth_post_drafts_owner_or_admin_all on public.growth_post_drafts;
create policy growth_post_drafts_owner_or_admin_all on public.growth_post_drafts
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists growth_carousel_decks_owner_or_admin_all on public.growth_carousel_decks;
create policy growth_carousel_decks_owner_or_admin_all on public.growth_carousel_decks
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists growth_swipe_files_owner_or_admin_all on public.growth_swipe_files;
create policy growth_swipe_files_owner_or_admin_all on public.growth_swipe_files
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists growth_engagement_streaks_owner_or_admin_all on public.growth_engagement_streaks;
create policy growth_engagement_streaks_owner_or_admin_all on public.growth_engagement_streaks
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists growth_crm_leads_owner_or_admin_all on public.growth_crm_leads;
create policy growth_crm_leads_owner_or_admin_all on public.growth_crm_leads
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists growth_integrations_owner_or_admin_all on public.growth_integrations;
create policy growth_integrations_owner_or_admin_all on public.growth_integrations
for all
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists subscriptions_owner_or_admin_select on public.subscriptions;
create policy subscriptions_owner_or_admin_select on public.subscriptions
for select
using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists subscriptions_owner_or_admin_update on public.subscriptions;
create policy subscriptions_owner_or_admin_update on public.subscriptions
for update
using (user_id = auth.uid() or public.current_user_is_admin())
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists subscriptions_owner_or_admin_insert on public.subscriptions;
create policy subscriptions_owner_or_admin_insert on public.subscriptions
for insert
with check (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists app_monitoring_events_owner_or_admin_insert on public.app_monitoring_events;
create policy app_monitoring_events_owner_or_admin_insert on public.app_monitoring_events
for insert
with check (user_id = auth.uid() or public.current_user_is_admin() or user_id is null);

drop policy if exists app_monitoring_events_owner_or_admin_select on public.app_monitoring_events;
create policy app_monitoring_events_owner_or_admin_select on public.app_monitoring_events
for select
using (user_id = auth.uid() or public.current_user_is_admin() or user_id is null);

create or replace function public.get_shared_project(p_share_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share public.shared_links%rowtype;
  v_project public.user_projects%rowtype;
begin
  select *
  into v_share
  from public.shared_links
  where share_id = p_share_id
    and is_active = true
    and (expires_at is null or expires_at > now())
  limit 1;

  if v_share.id is null then
    return null;
  end if;

  update public.shared_links
  set views = views + 1
  where id = v_share.id;

  select *
  into v_project
  from public.user_projects
  where id = v_share.project_id;

  if v_project.id is null then
    return null;
  end if;

  return to_jsonb(v_project);
end;
$$;

grant execute on function public.get_shared_project(text) to anon, authenticated;

commit;
