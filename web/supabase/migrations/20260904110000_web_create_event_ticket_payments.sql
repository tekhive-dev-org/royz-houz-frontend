create table if not exists public.event_ticket_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  event_id uuid not null references public.events(id) on delete restrict,
  tier_id text not null,
  tier_name text not null,
  quantity integer not null check (quantity between 1 and 10),
  amount_kobo integer not null check (amount_kobo > 0),
  customer jsonb not null default '{}'::jsonb,
  paystack_transaction_id text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists event_ticket_orders_event_id_idx on public.event_ticket_orders(event_id);
create index if not exists event_ticket_orders_status_idx on public.event_ticket_orders(status, created_at desc);
alter table public.event_ticket_orders enable row level security;

create or replace function public.complete_event_ticket_payment(
  p_reference text,
  p_paystack_transaction_id text
)
returns public.event_ticket_orders
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  order_row public.event_ticket_orders;
  event_row public.events;
  tier_index integer;
  tier jsonb;
  current_available integer;
  updated_tiers jsonb;
begin
  select * into order_row from public.event_ticket_orders where reference = p_reference for update;
  if not found then raise exception 'Ticket order not found'; end if;
  if order_row.status = 'paid' then return order_row; end if;

  select * into event_row from public.events where id = order_row.event_id for update;
  if not found or event_row.status <> 'published' then raise exception 'Event is not available'; end if;

  select ordinality::integer, value into tier_index, tier
  from jsonb_array_elements(coalesce(event_row.body->'ticketTiers', '[]'::jsonb)) with ordinality
  where value->>'id' = order_row.tier_id;
  if tier_index is null then raise exception 'Ticket tier not found'; end if;

  if (tier->>'available') is not null and (tier->>'available') <> '' then
    current_available := greatest(0, (tier->>'available')::integer);
    if current_available < order_row.quantity then raise exception 'Not enough tickets available'; end if;
    updated_tiers := jsonb_set(event_row.body->'ticketTiers', array[(tier_index - 1)::text, 'available'], to_jsonb(current_available - order_row.quantity), true);
    updated_tiers := jsonb_set(updated_tiers, array[(tier_index - 1)::text, 'badge'], to_jsonb((current_available - order_row.quantity)::text || ' LEFT'), true);
    update public.events set body = jsonb_set(event_row.body, '{ticketTiers}', updated_tiers, true), updated_at = timezone('utc', now()) where id = event_row.id;
  end if;

  update public.event_ticket_orders
  set status = 'paid', paystack_transaction_id = p_paystack_transaction_id,
      paid_at = timezone('utc', now()), updated_at = timezone('utc', now())
  where id = order_row.id
  returning * into order_row;
  return order_row;
end;
$$;

revoke all on function public.complete_event_ticket_payment(text, text) from public, anon, authenticated;
grant execute on function public.complete_event_ticket_payment(text, text) to service_role;

drop trigger if exists event_ticket_orders_set_updated_at on public.event_ticket_orders;

create trigger event_ticket_orders_set_updated_at
before update on public.event_ticket_orders
for each row execute function public.set_updated_at();
