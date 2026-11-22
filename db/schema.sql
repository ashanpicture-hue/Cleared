create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null check (phone ~ '^\+923\d{9}$'),
  name text not null check (length(name) between 1 and 120),
  role text not null default 'customer' check (role in ('customer','reviewer','admin')),
  plan text not null default 'free' check (plan in ('free','desk')),
  free_orders_used int not null default 0,
  free_orders_limit int not null default 10,
  seats int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table otps (
  phone text primary key,
  code_hash bytea not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  sent_at timestamptz not null default now(),
  window_start timestamptz not null default now(),
  sends_in_window int not null default 1,
  pending_name text
);

create table shipments (
  id text primary key,
  reference text not null,
  user_id uuid not null references users(id),
  buyer text not null default '',
  lc_terms text not null default '',
  forward_text text not null default '',
  status text not null default 'queued' check (status in ('queued','extracting','needs_review','under_review','completed')),
  extracted jsonb not null default '{}',
  findings jsonb not null default '[]',
  agent_note text,
  reviewer_note text,
  fee int not null default 0,
  free boolean not null default false,
  paid boolean not null default false,
  paid_at timestamptz,
  model_cost_pkr numeric not null default 0,
  review_minutes int not null default 0,
  reviewer_id uuid references users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, reference)
);
create index on shipments (user_id, created_at desc);
create index on shipments (status, created_at);

create table documents (
  id uuid primary key default gen_random_uuid(),
  shipment_id text not null references shipments(id) on delete cascade,
  name text not null,
  mime text not null,
  size int not null,
  storage_path text not null
);
create index on documents (shipment_id);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  shipment_id text not null references shipments(id),
  user_id uuid not null references users(id),
  reason text not null,
  amount int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  created_at timestamptz not null default now(),
  unique (shipment_id)
);

create table audit_log (
  id bigserial primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Create the first admin by hand, then add reviewers from the admin page:
-- insert into users (phone, name, role) values ('+923XXXXXXXXX', 'Your name', 'admin');
