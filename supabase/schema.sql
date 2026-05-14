-- Run this in Supabase SQL Editor
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  room_type text not null,
  check_in date not null,
  check_out date not null,
  guests text,
  special_requests text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_valid_stay check (check_out > check_in)
);

create index if not exists reservations_room_dates_idx
  on public.reservations (room_type, check_in, check_out);

-- Hard guard against double-booking for active reservations.
alter table public.reservations
  drop constraint if exists no_overlapping_reservations;

alter table public.reservations
  add constraint no_overlapping_reservations
  exclude using gist (
    room_type with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

create or replace function public.touch_reservation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_touch_updated_at on public.reservations;
create trigger reservations_touch_updated_at
before update on public.reservations
for each row execute function public.touch_reservation_updated_at();

-- Atomic booking function used by the frontend.
create or replace function public.create_reservation_safe(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_room_type text,
  p_check_in date,
  p_check_out date,
  p_guests text,
  p_special_requests text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_reference text;
begin
  insert into public.reservations (
    first_name, last_name, email, phone, room_type, check_in, check_out, guests, special_requests, status
  )
  values (
    p_first_name, p_last_name, p_email, p_phone, p_room_type, p_check_in, p_check_out, p_guests, p_special_requests, 'confirmed'
  )
  returning booking_reference into v_booking_reference;

  return jsonb_build_object(
    'success', true,
    'booking_reference', v_booking_reference,
    'message', 'Reservation confirmed'
  );
exception
  when exclusion_violation then
    return jsonb_build_object(
      'success', false,
      'message', 'Selected dates are no longer available for this room'
    );
  when check_violation then
    return jsonb_build_object(
      'success', false,
      'message', 'Invalid check-in / check-out range'
    );
end;
$$;

grant execute on function public.create_reservation_safe(
  text, text, text, text, text, date, date, text, text
) to anon, authenticated;

-- RLS
alter table public.reservations enable row level security;

drop policy if exists reservations_insert_anon on public.reservations;
create policy reservations_insert_anon
  on public.reservations
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists reservations_select_anon on public.reservations;
create policy reservations_select_anon
  on public.reservations
  for select
  to anon, authenticated
  using (true);
