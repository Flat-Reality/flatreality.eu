create table if not exists public.channel_admin_attempts (
  request_key text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now()
);
alter table public.channel_admin_attempts enable row level security;
revoke all on public.channel_admin_attempts from anon, authenticated;
