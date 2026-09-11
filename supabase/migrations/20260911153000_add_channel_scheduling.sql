alter table public.channel_articles
  drop constraint if exists channel_articles_status_check;

alter table public.channel_articles
  add constraint channel_articles_status_check
  check (status in ('draft', 'scheduled', 'published'));

drop policy if exists "Published channel articles are public"
  on public.channel_articles;

create policy "Published channel articles are public"
  on public.channel_articles for select to anon, authenticated
  using (
    status = 'published'
    or (status = 'scheduled' and published_at is not null and published_at <= now())
  );

create index if not exists channel_articles_publication_idx
  on public.channel_articles (published_at desc)
  where status in ('published', 'scheduled');
