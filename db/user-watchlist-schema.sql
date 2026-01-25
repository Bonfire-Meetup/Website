create table if not exists user_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  video_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create index if not exists user_watchlist_user_id_idx on user_watchlist (user_id);
create index if not exists user_watchlist_video_id_idx on user_watchlist (video_id);
create index if not exists user_watchlist_created_at_idx on user_watchlist (created_at desc);
