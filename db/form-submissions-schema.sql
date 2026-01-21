create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  inquiry_type text,
  subject text not null,
  message text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx on contact_submissions (created_at desc);
create index if not exists contact_submissions_ip_hash_idx on contact_submissions (ip_hash);

create table if not exists talk_proposals (
  id uuid primary key default gen_random_uuid(),
  speaker_name text not null,
  email text not null,
  talk_title text not null,
  abstract text not null,
  duration text not null,
  experience text,
  preferred_location text,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists talk_proposals_created_at_idx on talk_proposals (created_at desc);
create index if not exists talk_proposals_ip_hash_idx on talk_proposals (ip_hash);
