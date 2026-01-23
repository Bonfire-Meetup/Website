create table if not exists user_boost_allocation (
  user_id uuid primary key references app_user(id) on delete cascade,
  available_boosts int not null default 2,
  last_allocation_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_boost_allocation_last_allocation_idx
  on user_boost_allocation (last_allocation_date);
