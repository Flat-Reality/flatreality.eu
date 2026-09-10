create table if not exists public.channel_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  category text not null check (category in ('studio', 'rain-heart', 'the-nick', 'fr-partners')),
  excerpt text not null check (char_length(excerpt) between 1 and 320),
  content jsonb not null default '{"blocks": []}'::jsonb,
  cover_url text,
  cover_path text,
  delivery_channels text[] not null default array['website']::text[] check ('website' = any(delivery_channels)),
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.channel_articles enable row level security;
grant select on public.channel_articles to anon, authenticated;
create policy "Published channel articles are public"
  on public.channel_articles for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

create table if not exists public.channel_admin_config (
  singleton boolean primary key default true check (singleton),
  password_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.channel_admin_config enable row level security;
revoke all on public.channel_admin_config from anon, authenticated;

-- Seed the singleton password hash out-of-band. Never commit the administrator password.
