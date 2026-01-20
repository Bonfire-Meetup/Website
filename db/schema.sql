create table if not exists video_hearts (
  video_id text not null,
  ip_hash text not null,
  ua_hash text not null,
  created_at timestamptz not null default now(),
  primary key (video_id, ip_hash, ua_hash)
);

create index if not exists video_hearts_video_id_idx on video_hearts (video_id);
