begin;

create or replace function public.can_access_team_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() = target_user_id
    or public.current_user_is_admin()
    or exists (
      select 1
      from public.teams t
      where (
        t.owner_id = auth.uid()
        or exists (
          select 1
          from public.team_members tm_self
          where tm_self.team_id = t.id
            and tm_self.user_id = auth.uid()
        )
      )
      and (
        t.owner_id = target_user_id
        or exists (
          select 1
          from public.team_members tm_target
          where tm_target.team_id = t.id
            and tm_target.user_id = target_user_id
        )
      )
    );
$$;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin on public.users
for select
using (public.can_access_team_user(id));

drop policy if exists user_projects_owner_or_admin_select on public.user_projects;
create policy user_projects_owner_or_admin_select on public.user_projects
for select
using (public.can_access_team_user(user_id));

commit;

