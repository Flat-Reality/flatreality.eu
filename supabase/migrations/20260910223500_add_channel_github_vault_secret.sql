create or replace function public.channel_github_token()
returns text
language sql
security definer
set search_path = pg_catalog, public, vault
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'github_channel_token'
  limit 1;
$$;

revoke all on function public.channel_github_token() from public, anon, authenticated;
grant execute on function public.channel_github_token() to service_role;
