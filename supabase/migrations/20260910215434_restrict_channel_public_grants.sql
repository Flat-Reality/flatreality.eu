grant select on public.channel_articles to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.channel_articles from anon, authenticated;
revoke all on public.channel_admin_config from anon, authenticated;
revoke all on public.channel_admin_attempts from anon, authenticated;
