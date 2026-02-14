# Supabase Schema Design (LinkedIn Banner Studio)

This schema is designed to match your current feature-based frontend and localStorage tables while upgrading to production-ready Postgres + RLS.

## Migration File

- `supabase/migrations/20260214_0001_initial_schema.sql`

Run this file in Supabase SQL editor (or Supabase CLI migrations).

## Table Mapping (Current App -> Supabase)

- `users` -> `public.users`
- `user_projects` -> `public.user_projects`
- `templates` -> `public.templates`
- `brand_kits` -> `public.brand_kits`
- `shared_links` -> `public.shared_links`
- `teams` -> `public.teams`
- `team_invites` -> `public.team_invites`
- `admin_audit_logs` -> `public.admin_audit_logs`
- `editor_content_config` -> `public.editor_content_config`
- draft key storage -> `public.project_drafts`
- growth tool keys -> `public.growth_*` tables
- monitoring key storage -> `public.app_monitoring_events`
- billing/plan state -> `public.subscriptions`

## Key Design Decisions

- Uses `auth.users` as source of identity.
- Keeps a `public.users` profile table because your app already uses `users` everywhere.
- Adds trigger `handle_new_auth_user` so every auth signup auto-creates a row in `public.users`.
- Adds strict row-level security for owner/admin access.
- Adds `current_user_is_admin()` helper function for policy consistency.
- Adds `get_shared_project(share_id)` RPC for safe public share preview without exposing all projects.

## First Admin Setup

After creating your first account in Supabase Auth, promote it in SQL:

```sql
update public.users
set role = 'admin', plan = 'pro', is_pro = true
where email = 'your-email@example.com';
```

## Next Integration Step in Frontend

Implement `src/services/providers/supabaseProvider.js` to map:

- `get(table, id)` -> `.from(table).select('*').eq('id', id).single()`
- `getAll(table, filter)` -> `.from(table).select('*')` + `.eq(...)` per filter
- `create(table, data)` -> `.insert(data).select().single()`
- `update(table, id, data)` -> `.update(data).eq('id', id).select().single()`
- `delete(table, id)` -> `.delete().eq('id', id)`

For share preview route, call RPC:

```js
supabase.rpc('get_shared_project', { p_share_id: shareId })
```

