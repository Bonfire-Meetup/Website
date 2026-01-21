create table if not exists video_likes (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  ip_hash text not null,
  ua_hash text not null,
  created_at timestamptz not null default now(),
  unique (video_id, ip_hash, ua_hash)
);

create index if not exists video_likes_video_id_idx on video_likes (video_id);
