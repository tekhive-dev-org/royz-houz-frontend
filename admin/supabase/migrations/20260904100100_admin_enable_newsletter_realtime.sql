do $$
begin
  if to_regclass('public.newsletter_subscriptions') is not null and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'newsletter_subscriptions'
  ) then
    alter publication supabase_realtime add table public.newsletter_subscriptions;
  end if;
end $$;
