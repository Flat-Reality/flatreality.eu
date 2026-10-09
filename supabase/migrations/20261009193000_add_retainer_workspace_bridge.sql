create table if not exists public.retainer_offerings (
  id text primary key,
  type text not null check (type in ('specialist', 'team', 'capacity')),
  category text not null,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  roles text[] not null default '{}',
  published boolean not null default false,
  availability text not null default 'unknown' check (availability in ('available', 'limited', 'unavailable', 'unknown')),
  checked_at timestamptz,
  reason_code text,
  updated_at timestamptz not null default now()
);

alter table public.retainer_offerings enable row level security;
drop policy if exists "Published retainer offerings are public" on public.retainer_offerings;
create policy "Published retainer offerings are public"
  on public.retainer_offerings for select
  to anon, authenticated
  using (published = true);

revoke all on public.retainer_offerings from public, anon, authenticated;
grant select (id, type, category, title, description, tags, roles, availability, checked_at, reason_code)
  on public.retainer_offerings to anon, authenticated;
grant all on public.retainer_offerings to service_role;

alter table public.partner_inquiries
  add column if not exists workspace_assignee_ids text[] not null default '{}';

create or replace function public.get_retainer_workspace_bridge_token()
returns text
language sql
security definer
set search_path = public, vault
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'retainer_workspace_bridge_token'
  limit 1
$$;

revoke all on function public.get_retainer_workspace_bridge_token() from public, anon, authenticated;
grant execute on function public.get_retainer_workspace_bridge_token() to service_role;

