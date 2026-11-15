-- Kola6a CRM / Initial schema (PostgreSQL / Supabase)
-- No browser-accessible policies are defined intentionally. RLS denies anonymous/authenticated access until server-side authorization is implemented.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null check (role in ('owner','admin','employee','accountant','manager')),
  created_at timestamptz not null default now()
);

create table public.directions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  direction_id uuid not null references public.directions(id),
  name text not null,
  unique(direction_id,name)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  code text not null unique,
  name text not null,
  kind text not null check(kind in ('rental','product','service')),
  unit text not null check(unit in ('hour','day','piece','booking')),
  requires_booking boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  inventory_code text not null unique,
  name text not null,
  status text not null default 'available' check(status in ('available','occupied','maintenance','inactive'))
);

create table public.price_rules (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  label text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'UAH' check(currency = 'UAH'),
  valid_from date,
  valid_until date,
  min_units numeric(12,2),
  max_units numeric(12,2),
  priority integer not null default 0,
  active boolean not null default true,
  check(valid_from is null or valid_until is null or valid_until >= valid_from),
  check(min_units is null or max_units is null or max_units >= min_units)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  resource_id uuid references public.resources(id),
  direction_id uuid not null references public.directions(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check(status in ('draft','confirmed','checked_in','completed','cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check(ends_at > starts_at)
);
-- Resource overlap checks must be added transactionally before allowing live bookings.

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  customer_id uuid references public.customers(id),
  status text not null default 'draft' check(status in ('draft','confirmed','cancelled','refunded')),
  source text not null default 'manual',
  source_external_id text,
  created_by uuid references public.profiles(id),
  reported_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(source,source_external_id)
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id),
  service_id uuid not null references public.services(id),
  direction_id uuid not null references public.directions(id),
  quantity numeric(12,2) not null check(quantity > 0),
  unit_price_minor bigint not null check(unit_price_minor >= 0),
  discount_minor bigint not null default 0 check(discount_minor >= 0),
  total_minor bigint generated always as ((quantity * unit_price_minor)::bigint - discount_minor) stored,
  price_reason text,
  check(discount_minor <= (quantity * unit_price_minor)::bigint)
);

create table public.cash_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check(type in ('cash','safe','bank','card_clearing')),
  currency text not null default 'UAH' check(currency = 'UAH'),
  active boolean not null default true
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  cash_account_id uuid not null references public.cash_accounts(id),
  amount_minor bigint not null check(amount_minor > 0),
  method text not null check(method in ('cash','card','fop','other')),
  received_at timestamptz not null default now(),
  source text not null default 'manual',
  external_id text,
  created_by uuid references public.profiles(id),
  unique(source,external_id)
);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id),
  sale_id uuid not null references public.sales(id),
  amount_minor bigint not null check(amount_minor > 0),
  unique(payment_id,sale_id)
);
-- Allocation sum <= payment amount and sale balance checks must be enforced by transactional backend.

create table public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  from_account_id uuid not null references public.cash_accounts(id),
  to_account_id uuid not null references public.cash_accounts(id),
  amount_minor bigint not null check(amount_minor > 0),
  happened_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  check(from_account_id <> to_account_id)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  direction_id uuid references public.directions(id),
  cash_account_id uuid not null references public.cash_accounts(id),
  category text not null,
  amount_minor bigint not null check(amount_minor > 0),
  occurred_at timestamptz not null default now(),
  note text,
  created_by uuid references public.profiles(id)
);

create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  business_date date not null,
  direction_id uuid not null references public.directions(id),
  status text not null default 'draft' check(status in ('draft','submitted','approved','closed')),
  created_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(business_date,direction_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  filename text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

-- Default-deny RLS. Add audited granular policies or server-only data access later.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','directions','categories','services','resources','price_rules',
    'customers','bookings','sales','sale_items','cash_accounts','payments',
    'payment_allocations','cash_movements','expenses','daily_reports','audit_logs','import_batches'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

insert into public.directions(code,name) values
 ('houses','Домики'),
 ('beach','Пляж'),
 ('recreation','Развлечения и водный транспорт'),
 ('extras','Дополнительные услуги'),
 ('events','Аренда территории и мероприятий')
on conflict (code) do nothing;
