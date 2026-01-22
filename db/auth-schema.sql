create extension if not exists pgcrypto;

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  allow_community_emails boolean not null default false
);

create index if not exists app_user_email_idx on app_user (email);

create table if not exists auth_challenge (
  id uuid primary key default gen_random_uuid(),
  challenge_token_hash text not null,
  email text not null,
  code_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  attempts int not null default 0,
  max_attempts int not null default 5,
  ip inet,
  user_agent text
);

create index if not exists auth_challenge_email_created_idx on auth_challenge (email, created_at desc);
create unique index if not exists auth_challenge_token_hash_idx on auth_challenge (challenge_token_hash);
create index if not exists auth_challenge_expires_idx on auth_challenge (expires_at);
create index if not exists auth_challenge_used_idx on auth_challenge (used_at);

create table if not exists auth_token (
  jti uuid primary key,
  user_id uuid not null references app_user(id) on delete cascade,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  ip inet,
  user_agent text
);

create index if not exists auth_token_user_idx on auth_token (user_id);
create index if not exists auth_token_expires_idx on auth_token (expires_at);

create table if not exists auth_attempt (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete set null,
  email_hash text not null,
  email_domain text,
  outcome text not null,
  created_at timestamptz not null default now(),
  ip_hash text,
  user_agent_hash text,
  request_id uuid
);

create index if not exists auth_attempt_email_created_idx on auth_attempt (email_hash, created_at desc);
create index if not exists auth_attempt_user_idx on auth_attempt (user_id);
