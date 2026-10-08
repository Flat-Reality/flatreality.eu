create table if not exists public.partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('FR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  organization text not null default '' check (char_length(organization) <= 160),
  email text not null check (char_length(email) <= 254),
  project_url text not null default '' check (char_length(project_url) <= 500),
  project_description text not null check (char_length(project_description) between 10 and 6000),
  selected_services text[] not null check (cardinality(selected_services) between 1 and 8),
  collaboration_model text not null check (collaboration_model in ('One-time Project', 'Production Module', 'Ongoing Support', 'Not Sure Yet')),
  project_stage text not null check (project_stage in ('Concept / Idea', 'Prototype', 'In Production', 'Released / Live')),
  budget_range text not null check (budget_range in ('Under €500', '€500–€2,000', '€2,000–€10,000', '€10,000+', 'Not Sure Yet')),
  timeline text not null check (timeline in ('As Soon As Possible', 'Within a Month', '1–3 Months', 'Flexible / Not Sure Yet')),
  source_page text not null default 'Flat Reality Partners / Outsourcing',
  status text not null default 'new' check (status in ('new', 'reviewing', 'contacted', 'proposal', 'won', 'lost', 'spam')),
  assigned_to uuid references auth.users(id) on delete set null,
  privacy_acknowledged boolean not null,
  privacy_notice_version text not null,
  retention_until timestamptz not null default (now() + interval '12 months'),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'disabled'))
);

create index if not exists partner_inquiries_created_at_idx on public.partner_inquiries (created_at desc);
create index if not exists partner_inquiries_status_idx on public.partner_inquiries (status, created_at desc);
create index if not exists partner_inquiries_email_idx on public.partner_inquiries (lower(email));

alter table public.partner_inquiries enable row level security;
revoke all on table public.partner_inquiries from anon, authenticated;
grant all on table public.partner_inquiries to service_role;

create table if not exists public.partner_inquiry_rate_limits (
  request_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.partner_inquiry_rate_limits enable row level security;
revoke all on table public.partner_inquiry_rate_limits from anon, authenticated;
grant all on table public.partner_inquiry_rate_limits to service_role;

create or replace function public.consume_partner_inquiry_rate_limit(
  p_request_key text,
  p_limit integer default 5,
  p_window interval default interval '1 hour'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  insert into public.partner_inquiry_rate_limits as limits (request_key, window_started_at, request_count, updated_at)
  values (p_request_key, now(), 1, now())
  on conflict (request_key) do update
  set request_count = case
        when limits.window_started_at < now() - p_window then 1
        else limits.request_count + 1
      end,
      window_started_at = case
        when limits.window_started_at < now() - p_window then now()
        else limits.window_started_at
      end,
      updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_partner_inquiry_rate_limit(text, integer, interval) from public, anon, authenticated;
grant execute on function public.consume_partner_inquiry_rate_limit(text, integer, interval) to service_role;
