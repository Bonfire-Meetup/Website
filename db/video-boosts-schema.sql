create table if not exists video_boosts (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  user_id uuid not null references app_user(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);

create index if not exists video_boosts_video_id_idx on video_boosts (video_id);
create index if not exists video_boosts_user_id_idx on video_boosts (user_id);
