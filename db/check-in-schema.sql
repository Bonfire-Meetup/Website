create table if not exists check_in (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  event_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index if not exists check_in_user_id_idx on check_in (user_id);
create index if not exists check_in_event_id_idx on check_in (event_id);
create index if not exists check_in_created_at_idx on check_in (created_at desc);
