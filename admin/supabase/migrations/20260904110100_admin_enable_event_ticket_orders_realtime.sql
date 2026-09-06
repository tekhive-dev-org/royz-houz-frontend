alter publication supabase_realtime add table public.event_ticket_orders;

create policy admin_read_event_ticket_orders_realtime
  on public.event_ticket_orders for select to authenticated
  using (public.has_admin_permission('events.create'));
